/**
 * useVietnamAddress
 * Fetches Vietnamese administrative data (provinces, districts, wards)
 * from the free public API: provinces.open-api.vn
 *
 * API reference:
 *  - GET /p/                        → list all provinces
 *  - GET /p/{code}?depth=2          → province + districts
 *  - GET /d/{code}?depth=2          → district + wards
 */
import { useState, useEffect, useCallback } from "react";

const API = "https://provinces.open-api.vn/api";
const TIMEOUT_MS = 8000;

export type VnProvince = {
  code: number;
  name: string;
  division_type: string;
  codename?: string;
  phone_code?: number;
};

export type VnDistrict = {
  code: number;
  name: string;
  division_type: string;
  codename?: string;
  province_code?: number;
};

export type VnWard = {
  code: number;
  name: string;
  division_type: string;
  codename?: string;
  district_code?: number;
};

type FetchState<T> = {
  data: T[];
  isLoading: boolean;
  error: string | null;
};

/**
 * Hàm gọi API nguyên bản (Native Fetch API) có giới hạn thời gian chờ (Timeout):
 * 
 * 1. async/await:
 *    - async khai báo hàm xử lý tác vụ bất đồng bộ, luôn trả về một Promise.
 *    - await tạm dừng thực thi trong hàm cho đến khi Promise hoàn thành, giúp viết code tuần tự, dễ đọc.
 * 
 * 2. AbortController & signal:
 *    - Tạo đối tượng điều khiển hủy request.
 *    - Nếu sau TIMEOUT_MS (8 giây) API chưa phản hồi, controller.abort() sẽ tự động ngắt kết nối.
 * 
 * 3. res.ok:
 *    - Fetch API không tự ném lỗi khi gặp mã HTTP 4xx hoặc 5xx.
 *    - Thuộc tính res.ok trả về true nếu HTTP status nằm trong khoảng 200–299.
 *    - Nếu res.ok là false, chủ động ném Error kèm mã HTTP để khối catch xử lý.
 * 
 * 4. res.json():
 *    - Chuyển đổi luồng dữ liệu (ReadableStream) dạng chuỗi JSON trả về thành đối tượng Javascript.
 * 
 * 5. try / catch / finally:
 *    - try: Thực thi các câu lệnh gọi API có nguy cơ xảy ra ngoại lệ.
 *    - catch: Bắt lỗi mạng hoặc lỗi timeout để xử lý an toàn.
 *    - finally: Luôn luôn chạy (dù thành công hay lỗi) để dọn dẹp bộ đếm thời gian clearTimeout(id).
 */
async function fetchWithTimeout<T>(url: string): Promise<T> {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), TIMEOUT_MS);
  try {
    const res = await fetch(url, { signal: controller.signal });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return (await res.json()) as T;
  } finally {
    clearTimeout(id);
  }
}

/** 
 * Custom Hook: useProvinces
 * Tải danh sách 63 tỉnh/thành phố Việt Nam từ API công khai.
 * Sử dụng biến cờ `cancelled` trong hàm cleanup của useEffect để ngăn chặn lỗi Memory Leak
 * nếu component bị unmount trước khi API kịp phản hồi.
 */
export function useProvinces(): FetchState<VnProvince> {
  const [state, setState] = useState<FetchState<VnProvince>>({
    data: [],
    isLoading: true,
    error: null,
  });

  useEffect(() => {
    let cancelled = false;
    setState({ data: [], isLoading: true, error: null });

    fetchWithTimeout<VnProvince[]>(`${API}/p/`)
      .then((data) => {
        if (!cancelled) setState({ data, isLoading: false, error: null });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: [],
            isLoading: false,
            error: err.message || "Không thể tải dữ liệu tỉnh/thành",
          });
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return state;
}

/**
 * Hook tải danh sách Quận/Huyện theo mã Tỉnh/Thành đã chọn.
 *
 * @param provinceCode - Mã số tỉnh/thành (ví dụ: 1 = Hà Nội, 79 = TP.HCM).
 *   Nếu là null (chưa chọn tỉnh), hook không gọi API và trả về mảng rỗng.
 * @returns FetchState<VnDistrict> - Object gồm: data (mảng quận/huyện),
 *   isLoading (đang tải), error (thông báo lỗi nếu có).
 *
 * Lưu ý quan trọng:
 * - Hook này phụ thuộc vào `provinceCode`. Mỗi khi người dùng đổi tỉnh,
 *   React sẽ chạy lại useEffect do `provinceCode` thay đổi → tự động
 *   tải danh sách quận/huyện tương ứng (Cascading Dropdown).
 * - API được gọi với `?depth=2` để lấy kèm theo dữ liệu con (districts).
 */
export function useDistricts(
  provinceCode: number | null
): FetchState<VnDistrict> {
  const [state, setState] = useState<FetchState<VnDistrict>>({
    data: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Nếu chưa chọn tỉnh/thành, xóa danh sách quận/huyện và thoát sớm
    if (!provinceCode) {
      setState({ data: [], isLoading: false, error: null });
      return;
    }
    // Biến cờ chống Memory Leak: nếu component unmount trước khi API phản hồi,
    // `cancelled = true` sẽ ngăn việc gọi setState trên component đã bị hủy.
    let cancelled = false;
    // Hiển thị trạng thái "đang tải" trong khi chờ API phản hồi
    setState({ data: [], isLoading: true, error: null });

    // Gọi API với mã tỉnh, ?depth=2 yêu cầu API trả về danh sách quận con kèm theo
    fetchWithTimeout<{ districts?: VnDistrict[] }>(
      `${API}/p/${provinceCode}?depth=2`
    )
      .then((data) => {
        if (!cancelled)
          setState({
            // `data.districts ?? []`: nếu trường districts không tồn tại thì dùng mảng rỗng
            data: data.districts ?? [],
            isLoading: false,
            error: null,
          });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: [],
            isLoading: false,
            error: err.message || "Không thể tải dữ liệu quận/huyện",
          });
      });

    // Hàm cleanup: đánh dấu cancelled = true khi useEffect chạy lại
    // (do provinceCode thay đổi) hoặc khi component bị unmount
    return () => {
      cancelled = true;
    };
  }, [provinceCode]); // Dependency: chạy lại mỗi khi mã tỉnh thay đổi

  return state;
}

/**
 * Hook tải danh sách Phường/Xã/Thị trấn theo mã Quận/Huyện đã chọn.
 *
 * @param districtCode - Mã số quận/huyện.
 *   Nếu là null (chưa chọn quận), hook không gọi API và trả về mảng rỗng.
 * @returns FetchState<VnWard> - Object gồm: data (mảng phường/xã),
 *   isLoading, error.
 *
 * Cơ chế hoạt động tương tự `useDistricts`: phụ thuộc vào `districtCode`,
 * mỗi khi người dùng đổi quận/huyện, React chạy lại useEffect và tải
 * danh sách phường/xã tương ứng. Đây là tầng thứ 3 trong chuỗi
 * Cascading Dropdown: Tỉnh → Quận → Phường.
 *
 * API endpoint `/d/{districtCode}?depth=2` trả về object chứa mảng `wards`.
 */
export function useWards(districtCode: number | null): FetchState<VnWard> {
  const [state, setState] = useState<FetchState<VnWard>>({
    data: [],
    isLoading: false,
    error: null,
  });

  useEffect(() => {
    // Nếu chưa chọn quận/huyện, xóa danh sách phường/xã và thoát sớm
    if (!districtCode) {
      setState({ data: [], isLoading: false, error: null });
      return;
    }
    // Biến cờ chống Memory Leak khi component unmount
    let cancelled = false;
    setState({ data: [], isLoading: true, error: null });

    // Gọi API với mã quận, ?depth=2 để lấy kèm danh sách phường/xã con
    fetchWithTimeout<{ wards?: VnWard[] }>(`${API}/d/${districtCode}?depth=2`)
      .then((data) => {
        if (!cancelled)
          setState({
            // `data.wards ?? []`: lấy mảng wards, hoặc mảng rỗng nếu không có
            data: data.wards ?? [],
            isLoading: false,
            error: null,
          });
      })
      .catch((err) => {
        if (!cancelled)
          setState({
            data: [],
            isLoading: false,
            error: err.message || "Không thể tải dữ liệu phường/xã",
          });
      });

    // Cleanup: hủy cập nhật state nếu component unmount hoặc districtCode thay đổi
    return () => {
      cancelled = true;
    };
  }, [districtCode]); // Dependency: chạy lại khi mã quận/huyện thay đổi

  return state;
}

/**
 * Hook tổng hợp quản lý toàn bộ trạng thái chọn địa chỉ 3 cấp:
 * Tỉnh/Thành → Quận/Huyện → Phường/Xã (Cascading Dropdown).
 *
 * Hook này kết hợp 3 hook con (useProvinces, useDistricts, useWards)
 * và cung cấp các hàm xử lý sự kiện thay đổi địa chỉ. Đây là hook duy nhất
 * mà các component cần gọi — không cần gọi trực tiếp 3 hook con.
 *
 * @returns Object chứa:
 *   - provinces/districts/wards: Dữ liệu danh sách kèm trạng thái loading/error
 *   - provinceName/districtName/wardName: Tên địa chỉ dạng chuỗi để lưu vào DB
 *   - selectedProvinceCode/selectedDistrictCode: Mã số (code) để gọi API tiếp theo
 *   - handleProvinceChange/handleDistrictChange/handleWardChange: Hàm xử lý khi người dùng chọn
 *   - reset(): Xóa toàn bộ lựa chọn về trạng thái ban đầu
 *   - prefill(p, d, w): Điền sẵn địa chỉ cũ khi chỉnh sửa thông tin
 */
export function useVietnamAddress() {
  // Tải danh sách tất cả tỉnh/thành (gọi một lần khi hook mount)
  const provinces = useProvinces();

  // Lưu mã số (code) của tỉnh/quận đang được chọn.
  // useDistricts và useWards sẽ tự động tải dữ liệu khi code này thay đổi.
  const [selectedProvinceCode, setSelectedProvinceCode] = useState<
    number | null
  >(null);
  const [selectedDistrictCode, setSelectedDistrictCode] = useState<
    number | null
  >(null);

  // Các hook con phụ thuộc vào mã số đang chọn — tự động re-fetch khi code thay đổi
  const districts = useDistricts(selectedProvinceCode);
  const wards = useWards(selectedDistrictCode);

  // Lưu tên địa chỉ dạng chuỗi để hiển thị và lưu vào Database
  // (DB lưu tên, không lưu mã số vì mã có thể thay đổi theo thời gian)
  const [provinceName, setProvinceName] = useState("");
  const [districtName, setDistrictName] = useState("");
  const [wardName, setWardName] = useState("");

  /**
   * Xử lý khi người dùng chọn một Tỉnh/Thành mới.
   * Đặt lại Quận/Huyện và Phường/Xã về rỗng vì chúng phụ thuộc vào tỉnh đã chọn.
   * useCallback với dependency rỗng [] giúp hàm không bị tạo lại mỗi lần render.
   */
  const handleProvinceChange = useCallback(
    (code: number, name: string) => {
      setSelectedProvinceCode(code);
      setProvinceName(name);
      // Reset cấp 2 và 3 khi cấp 1 thay đổi
      setSelectedDistrictCode(null);
      setDistrictName("");
      setWardName("");
    },
    []
  );

  /**
   * Xử lý khi người dùng chọn một Quận/Huyện mới.
   * Đặt lại Phường/Xã về rỗng vì phường phụ thuộc vào quận đang chọn.
   */
  const handleDistrictChange = useCallback((code: number, name: string) => {
    setSelectedDistrictCode(code);
    setDistrictName(name);
    // Reset cấp 3 khi cấp 2 thay đổi
    setWardName("");
  }, []);

  /**
   * Xử lý khi người dùng chọn một Phường/Xã.
   * Chỉ lưu tên (không cần mã vì phường là cấp cuối cùng).
   */
  const handleWardChange = useCallback((name: string) => {
    setWardName(name);
  }, []);

  /**
   * Xóa toàn bộ lựa chọn địa chỉ về trạng thái ban đầu.
   * Thường được gọi sau khi submit form thành công hoặc người dùng bấm "Hủy".
   */
  const reset = useCallback(() => {
    setSelectedProvinceCode(null);
    setSelectedDistrictCode(null);
    setProvinceName("");
    setDistrictName("");
    setWardName("");
  }, []);

  /**
   * Điền sẵn địa chỉ đã lưu khi người dùng chỉnh sửa thông tin (Edit mode).
   * Dữ liệu đầu vào là tên chuỗi (vd: "Hà Nội", "Hoàn Kiếm", "Hàng Trống"),
   * không phải mã số — vì đây là dữ liệu được lưu trong Database.
   *
   * @param p - Tên tỉnh/thành (sẽ cố gắng khớp với danh sách đã tải để lấy code)
   * @param d - Tên quận/huyện
   * @param w - Tên phường/xã
   */
  const prefill = useCallback(
    (p: string, d: string, w: string) => {
      // Tìm province trong danh sách đã tải để lấy code (không phân biệt hoa/thường)
      // Match province by name from loaded list
      const matchedProvince = provinces.data.find(
        (pv) => pv.name === p || pv.name.toLowerCase() === p.toLowerCase()
      );
      if (matchedProvince) {
        // Nếu tìm thấy: đặt code để kích hoạt tải danh sách quận tương ứng
        setSelectedProvinceCode(matchedProvince.code);
        setProvinceName(matchedProvince.name);
      } else {
        // Nếu không tìm thấy trong danh sách (tỉnh cũ, đổi tên...): vẫn hiển thị tên
        setProvinceName(p);
      }
      // Quận và phường chỉ lưu tên, không cần code vì không có API tra ngược
      setDistrictName(d);
      setWardName(w);
    },
    [provinces.data] // Cần `provinces.data` trong dependency để tìm kiếm đúng danh sách
  );

  // Trả về tất cả dữ liệu và hàm xử lý cho component sử dụng
  return {
    provinces,
    districts,
    wards,
    selectedProvinceCode,
    selectedDistrictCode,
    provinceName,
    districtName,
    wardName,
    handleProvinceChange,
    handleDistrictChange,
    handleWardChange,
    reset,
    prefill,
  };
}
