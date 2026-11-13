const axios = require('axios');
const env = require('../config/env');
const ApiError = require('../utils/ApiError');

const shippingConfig = {
  baseFee: 15000,
  freeRadiusKm: 2,
  perKmFee: 5000,
  minFee: 15000,
  maxFee: 80000,
  freeShippingThreshold: 500000,
  maxDeliveryDistanceKm: 30
};

const SALON_LAT = parseFloat(process.env.SALON_LAT) || 11.854;
const SALON_LNG = parseFloat(process.env.SALON_LNG) || 106.598;

/**
 * Haversine formula to compute straight line distance in km
 */
const haversineDistance = (coords1, coords2) => {
  const toRad = (x) => (x * Math.PI) / 180;
  const R = 6371; // Earth radius in km
  const dLat = toRad(coords2.lat - coords1.lat);
  const dLng = toRad(coords2.lng - coords1.lng);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(coords1.lat)) *
      Math.cos(toRad(coords2.lat)) *
      Math.sin(dLng / 2) *
      Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
};

/**
 * Geocode an address object to coordinates { lat, lng }
 */
const geocodeAddress = async (addressObj) => {
  const { province, district, ward, street } = addressObj;
  const addressStr = `${street}, ${ward}, ${district}, ${province}, Việt Nam`;

  const goongKey = process.env.GOONG_API_KEY;
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;

  try {
    // 1. Goong Maps Geocoding
    if (goongKey) {
      const res = await axios.get('https://rsapi.goong.io/geocode', {
        params: { address: addressStr, api_key: goongKey },
        timeout: 5000
      });
      if (res.data?.results?.[0]?.geometry?.location) {
        const { lat, lng } = res.data.results[0].geometry.location;
        return { lat: parseFloat(lat), lng: parseFloat(lng), fullAddress: addressStr };
      }
    }

    // 2. Google Maps Geocoding
    if (googleKey) {
      const res = await axios.get('https://maps.googleapis.com/maps/api/geocode/json', {
        params: { address: addressStr, key: googleKey },
        timeout: 5000
      });
      if (res.data?.results?.[0]?.geometry?.location) {
        const { lat, lng } = res.data.results[0].geometry.location;
        return { lat: parseFloat(lat), lng: parseFloat(lng), fullAddress: addressStr };
      }
    }

    // 3. Nominatim (OpenStreetMap) Geocoding as default fallback
    const query = encodeURIComponent(addressStr);
    const res = await axios.get(`https://nominatim.openstreetmap.org/search?q=${query}&format=json&limit=1`, {
      headers: { 'User-Agent': 'SalonDuongChiWeb/1.0' },
      timeout: 5000
    });

    if (res.data && res.data[0]) {
      const { lat, lon } = res.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon), fullAddress: addressStr };
    }

    // Try a simpler query if the detailed address was not resolved by OpenStreetMap
    const simpleQuery = encodeURIComponent(`${ward}, ${district}, ${province}, Việt Nam`);
    const simpleRes = await axios.get(`https://nominatim.openstreetmap.org/search?q=${simpleQuery}&format=json&limit=1`, {
      headers: { 'User-Agent': 'SalonDuongChiWeb/1.0' },
      timeout: 5000
    });

    if (simpleRes.data && simpleRes.data[0]) {
      const { lat, lon } = simpleRes.data[0];
      return { lat: parseFloat(lat), lng: parseFloat(lon), fullAddress: addressStr };
    }

    // Fallback if everything fails
    return { lat: SALON_LAT, lng: SALON_LNG, fullAddress: addressStr };
  } catch (error) {
    console.error('Geocoding error:', error.message);
    // Return standard coordinates so checkout doesn't completely crash if API is down
    return { lat: SALON_LAT, lng: SALON_LNG, fullAddress: addressStr };
  }
};

/**
 * Calculate distance in km between Salon and customer address
 */
const getDistanceKm = async (customerCoords) => {
  const goongKey = process.env.GOONG_API_KEY;
  const googleKey = process.env.GOOGLE_MAPS_API_KEY;
  const openRouteKey = process.env.OPENROUTE_API_KEY;

  const origin = { lat: SALON_LAT, lng: SALON_LNG };

  // If customer coordinates are exactly the fallback/salon coordinates, distance is 0
  if (customerCoords.lat === SALON_LAT && customerCoords.lng === SALON_LNG) {
    return 0;
  }

  try {
    // 1. Goong Maps Routing
    if (goongKey) {
      const res = await axios.get('https://rsapi.goong.io/direction', {
        params: {
          origin: `${origin.lat},${origin.lng}`,
          destination: `${customerCoords.lat},${customerCoords.lng}`,
          vehicle: 'car',
          api_key: goongKey
        },
        timeout: 5000
      });
      if (res.data?.routes?.[0]?.legs?.[0]?.distance?.value) {
        return res.data.routes[0].legs[0].distance.value / 1000;
      }
    }

    // 2. Google Maps Distance Matrix
    if (googleKey) {
      const res = await axios.get('https://maps.googleapis.com/maps/api/distancematrix/json', {
        params: {
          origins: `${origin.lat},${origin.lng}`,
          destinations: `${customerCoords.lat},${customerCoords.lng}`,
          key: googleKey
        },
        timeout: 5000
      });
      if (res.data?.rows?.[0]?.elements?.[0]?.distance?.value) {
        return res.data.rows[0].elements[0].distance.value / 1000;
      }
    }

    // 3. OpenRouteService Routing
    if (openRouteKey) {
      const res = await axios.get('https://api.openrouteservice.org/v2/directions/driving-car', {
        params: {
          api_key: openRouteKey,
          start: `${origin.lng},${origin.lat}`,
          end: `${customerCoords.lng},${customerCoords.lat}`
        },
        timeout: 5000
      });
      if (res.data?.features?.[0]?.properties?.summary?.distance) {
        return res.data.features[0].properties.summary.distance / 1000; // ORS returns in meters
      }
    }
  } catch (error) {
    console.error('Routing service error, falling back to Haversine:', error.message);
  }

  // Fallback: Haversine distance with 1.3 multiplier to approximate actual driving route
  const lineDistance = haversineDistance(origin, customerCoords);
  return Math.round(lineDistance * 1.3 * 10) / 10;
};

/**
 * Main function to calculate shipping fee
 */
const calculateShippingDetails = async (addressObj, subtotal) => {
  let { lat, lng } = addressObj;

  // Geocode address if coordinates are missing
  if (!lat || !lng) {
    const geo = await geocodeAddress(addressObj);
    lat = geo.lat;
    lng = geo.lng;
  }

  const distanceKm = await getDistanceKm({ lat, lng });

  if (distanceKm > shippingConfig.maxDeliveryDistanceKm) {
    return {
      isDeliverable: false,
      distanceKm: Math.round(distanceKm * 10) / 10,
      shippingFee: 0,
      message: 'Địa chỉ nằm ngoài khu vực giao hàng của Salon Dương Chi (Tối đa 30km).'
    };
  }

  // Calculate Fee
  let shippingFee = 0;
  if (subtotal < shippingConfig.freeShippingThreshold && distanceKm > shippingConfig.freeRadiusKm) {
    const rawFee = shippingConfig.baseFee + (distanceKm - shippingConfig.freeRadiusKm) * shippingConfig.perKmFee;
    const roundedFee = Math.round(rawFee / 1000) * 1000;
    shippingFee = Math.min(shippingConfig.maxFee, Math.max(shippingConfig.minFee, roundedFee));
  }

  // Estimate delivery time
  let estimatedDelivery = '1-2 ngày làm việc';
  if (distanceKm <= 5) {
    estimatedDelivery = 'Giao nhanh trong 2-4 giờ';
  } else if (distanceKm <= 15) {
    estimatedDelivery = 'Giao trong ngày';
  }

  return {
    isDeliverable: true,
    distanceKm: Math.round(distanceKm * 10) / 10,
    shippingFee,
    estimatedDelivery
  };
};

module.exports = {
  shippingConfig,
  geocodeAddress,
  getDistanceKm,
  calculateShippingDetails
};
