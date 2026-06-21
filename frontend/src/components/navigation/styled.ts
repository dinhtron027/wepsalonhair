import styled, { css, keyframes } from "styled-components";

// ─────────────────────────────────────────────────────────────────────────────
// DESIGN TOKENS
// ─────────────────────────────────────────────────────────────────────────────

export const tokens = {
  brand: "#c2185b",       // Rose-700 — màu thương hiệu chính
  brandLight: "#f48fb1",  // Rose nhạt
  brandHover: "#ad1457",  // Hover state
  text: "#1e293b",        // slate-800
  textMuted: "#64748b",   // slate-500
  textLight: "#94a3b8",   // slate-400
  bg: "rgba(255,255,255,0.92)",
  bgScrolled: "rgba(255,255,255,0.98)",
  shadow: "0 4px 24px rgba(194,24,91,0.10)",
  shadowHover: "0 8px 32px rgba(194,24,91,0.18)",
  border: "rgba(194,24,91,0.12)",
  radius: "12px",
  radiusLg: "20px",
  transition: "all 0.25s cubic-bezier(0.4, 0, 0.2, 1)",
  zNav: 1000,
  zDropdown: 1100,
} as const;

// ─────────────────────────────────────────────────────────────────────────────
// KEYFRAMES
// ─────────────────────────────────────────────────────────────────────────────

export const fadeSlideDown = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

export const fadeIn = keyframes`
  from { opacity: 0; }
  to   { opacity: 1; }
`;

export const slideInRight = keyframes`
  from { transform: translateX(100%); opacity: 0; }
  to   { transform: translateX(0);    opacity: 1; }
`;

// ─────────────────────────────────────────────────────────────────────────────
// NAVBAR WRAPPER
// ─────────────────────────────────────────────────────────────────────────────

export const NavbarWrapper = styled.header<{ $scrolled: boolean }>`
  position: fixed;
  inset-inline: 0;
  top: 0;
  z-index: ${tokens.zNav};
  transition: ${tokens.transition};

  ${({ $scrolled }) =>
    $scrolled
      ? css`
          background: ${tokens.bgScrolled};
          box-shadow: ${tokens.shadow};
          backdrop-filter: blur(16px);
        `
      : css`
          background: rgba(255, 255, 255, 0.7);
          backdrop-filter: blur(8px);
        `}
`;

export const NavbarInner = styled.div`
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 1.5rem;
  height: 72px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.5rem;
`;

// ─────────────────────────────────────────────────────────────────────────────
// LOGO
// ─────────────────────────────────────────────────────────────────────────────

export const LogoLink = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  text-decoration: none;
  flex-shrink: 0;
  font-size: 1.375rem;
  font-weight: 700;
  letter-spacing: -0.02em;
  color: ${tokens.brand};
  transition: ${tokens.transition};

  &:hover {
    color: ${tokens.brandHover};
    transform: scale(1.02);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// DESKTOP NAV
// ─────────────────────────────────────────────────────────────────────────────

export const DesktopNav = styled.nav`
  display: none;
  align-items: center;
  gap: 0.25rem;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

export const NavItemWrapper = styled.div`
  position: relative;
`;

export const NavLinkBase = styled.a<{ $active?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 0.35rem;
  padding: 0.5rem 0.875rem;
  border-radius: ${tokens.radius};
  font-size: 0.875rem;
  font-weight: 600;
  color: ${({ $active }) => ($active ? tokens.brand : tokens.text)};
  text-decoration: none;
  cursor: pointer;
  white-space: nowrap;
  transition: ${tokens.transition};
  border: none;
  background: ${({ $active }) =>
    $active ? `rgba(194,24,91,0.08)` : "transparent"};

  &:hover {
    color: ${tokens.brand};
    background: rgba(194, 24, 91, 0.06);
  }

  /* Chevron indicator */
  &[data-has-dropdown="true"]::after {
    content: "";
    display: inline-block;
    width: 0;
    height: 0;
    border-left: 4px solid transparent;
    border-right: 4px solid transparent;
    border-top: 5px solid currentColor;
    margin-left: 2px;
    transition: transform 0.2s ease;
  }

  &[data-dropdown-open="true"]::after {
    transform: rotate(180deg);
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// DROPDOWN
// ─────────────────────────────────────────────────────────────────────────────

export const DropdownWrapper = styled.div<{ $isOpen: boolean }>`
  position: absolute;
  top: calc(100% + 8px);
  left: 50%;
  transform: translateX(-50%);
  z-index: ${tokens.zDropdown};
  min-width: 460px;
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 0.25rem 0.5rem;
  background: white;
  border: 1px solid ${tokens.border};
  border-radius: ${tokens.radiusLg};
  box-shadow: ${tokens.shadowHover};
  padding: 1rem;
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  animation: ${({ $isOpen }) =>
    $isOpen
      ? css`
          ${fadeSlideDown} 0.22s cubic-bezier(0.4, 0, 0.2, 1) forwards
        `
      : "none"};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};

  /* Cái mũi tên nhỏ phía trên */
  &::before {
    content: "";
    position: absolute;
    top: -6px;
    left: 50%;
    transform: translateX(-50%);
    width: 12px;
    height: 12px;
    background: white;
    border-left: 1px solid ${tokens.border};
    border-top: 1px solid ${tokens.border};
    rotate: 45deg;
  }

  /* Bridge to close the gap between NavItemWrapper and DropdownWrapper */
  &::after {
    content: "";
    position: absolute;
    top: -12px;
    left: 0;
    right: 0;
    height: 12px;
    background: transparent;
  }
`;

export const DropdownItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.625rem;
  padding: 0.625rem 1rem;
  border-radius: ${tokens.radius};
  font-size: 0.875rem;
  font-weight: 500;
  color: ${tokens.text};
  text-decoration: none;
  transition: ${tokens.transition};
  cursor: pointer;

  .item-icon {
    font-size: 1rem;
    flex-shrink: 0;
  }

  &:hover {
    background: rgba(194, 24, 91, 0.06);
    color: ${tokens.brand};
    padding-left: 1.25rem;
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// CTA BUTTON + CART
// ─────────────────────────────────────────────────────────────────────────────

export const NavActions = styled.div`
  display: none;
  align-items: center;
  gap: 0.75rem;

  @media (min-width: 1024px) {
    display: flex;
  }
`;

export const CTAButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.4rem;
  padding: 0.6rem 1.25rem;
  border-radius: 999px;
  background: linear-gradient(135deg, ${tokens.brand} 0%, #e91e63 100%);
  color: white;
  font-size: 0.8125rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
  cursor: pointer;
  box-shadow: 0 4px 14px rgba(194, 24, 91, 0.35);
  transition: ${tokens.transition};
  white-space: nowrap;
  border: none;

  &:hover {
    background: linear-gradient(135deg, ${tokens.brandHover} 0%, #c2185b 100%);
    box-shadow: 0 6px 20px rgba(194, 24, 91, 0.45);
    transform: translateY(-1px);
  }

  &:active {
    transform: translateY(0);
  }
`;

export const CartButton = styled.button`
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border-radius: 50%;
  border: 1.5px solid ${tokens.border};
  background: white;
  color: ${tokens.text};
  cursor: pointer;
  transition: ${tokens.transition};

  &:hover {
    border-color: ${tokens.brand};
    color: ${tokens.brand};
    box-shadow: 0 2px 12px rgba(194, 24, 91, 0.15);
  }
`;

export const CartBadge = styled.span`
  position: absolute;
  top: -4px;
  right: -4px;
  min-width: 18px;
  height: 18px;
  padding: 0 4px;
  border-radius: 999px;
  background: ${tokens.brand};
  color: white;
  font-size: 0.65rem;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  animation: ${fadeIn} 0.2s ease;
`;

// ─────────────────────────────────────────────────────────────────────────────
// HAMBURGER (Mobile)
// ─────────────────────────────────────────────────────────────────────────────

export const MobileActions = styled.div`
  display: flex;
  align-items: center;
  gap: 0.625rem;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const HamburgerButton = styled.button<{ $isOpen: boolean }>`
  width: 40px;
  height: 40px;
  border-radius: ${tokens.radius};
  border: 1.5px solid ${tokens.border};
  background: white;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 5px;
  cursor: pointer;
  transition: ${tokens.transition};

  &:hover {
    border-color: ${tokens.brand};
  }

  span {
    display: block;
    width: 20px;
    height: 2px;
    background: ${tokens.text};
    border-radius: 2px;
    transition: ${tokens.transition};
    transform-origin: center;

    &:nth-child(1) {
      transform: ${({ $isOpen }) =>
        $isOpen ? "translateY(7px) rotate(45deg)" : "none"};
    }
    &:nth-child(2) {
      opacity: ${({ $isOpen }) => ($isOpen ? 0 : 1)};
      transform: ${({ $isOpen }) =>
        $isOpen ? "scaleX(0)" : "scaleX(1)"};
    }
    &:nth-child(3) {
      transform: ${({ $isOpen }) =>
        $isOpen ? "translateY(-7px) rotate(-45deg)" : "none"};
    }
  }
`;

// ─────────────────────────────────────────────────────────────────────────────
// MOBILE MENU OVERLAY
// ─────────────────────────────────────────────────────────────────────────────

export const MobileOverlay = styled.div<{ $isOpen: boolean }>`
  position: fixed;
  inset: 0;
  z-index: ${tokens.zNav - 1};
  background: rgba(0, 0, 0, 0.35);
  backdrop-filter: blur(2px);
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  transition: opacity 0.25s ease;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const MobilePanel = styled.nav<{ $isOpen: boolean }>`
  position: fixed;
  top: 72px;
  left: 0;
  right: 0;
  z-index: ${tokens.zNav};
  background: white;
  border-bottom: 1px solid ${tokens.border};
  box-shadow: ${tokens.shadow};
  padding: 1rem 1.5rem 1.5rem;
  max-height: calc(100vh - 72px);
  overflow-y: auto;
  -webkit-overflow-scrolling: touch;
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transform: ${({ $isOpen }) =>
    $isOpen ? "translateY(0)" : "translateY(-100%)"};
  opacity: ${({ $isOpen }) => ($isOpen ? 1 : 0)};
  pointer-events: ${({ $isOpen }) => ($isOpen ? "auto" : "none")};
  visibility: ${({ $isOpen }) => ($isOpen ? "visible" : "hidden")};
  transition: transform 0.3s cubic-bezier(0.4, 0, 0.2, 1),
    opacity 0.25s ease,
    visibility 0.3s ease;

  @media (min-width: 1024px) {
    display: none;
  }
`;

export const MobileNavItem = styled.a`
  display: flex;
  align-items: center;
  padding: 0.75rem 1rem;
  border-radius: ${tokens.radius};
  font-size: 1rem;
  font-weight: 600;
  color: ${tokens.text};
  text-decoration: none;
  transition: ${tokens.transition};

  &:hover {
    background: rgba(194, 24, 91, 0.06);
    color: ${tokens.brand};
  }
`;

export const MobileNavButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: space-between;
  width: 100%;
  padding: 0.75rem 1rem;
  border-radius: ${tokens.radius};
  font-size: 1rem;
  font-weight: 600;
  color: ${tokens.text};
  border: none;
  background: transparent;
  cursor: pointer;
  font-family: inherit;
  transition: ${tokens.transition};

  &:hover {
    background: rgba(194, 24, 91, 0.06);
    color: ${tokens.brand};
  }
`;

export const MobileDropdownSection = styled.div`
  padding-left: 1rem;
  border-left: 2px solid ${tokens.border};
  margin: 0.25rem 0 0.25rem 1rem;
`;

export const MobileDropdownItem = styled.a`
  display: flex;
  align-items: center;
  gap: 0.5rem;
  padding: 0.5rem 0.75rem;
  border-radius: 8px;
  font-size: 0.875rem;
  font-weight: 500;
  color: ${tokens.textMuted};
  text-decoration: none;
  transition: ${tokens.transition};

  &:hover {
    color: ${tokens.brand};
    background: rgba(194, 24, 91, 0.04);
  }
`;

export const MobileDivider = styled.hr`
  border: none;
  border-top: 1px solid ${tokens.border};
  margin: 0.75rem 0;
`;

export const MobileCTA = styled.a`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 100%;
  padding: 0.875rem;
  border-radius: 999px;
  background: linear-gradient(135deg, ${tokens.brand} 0%, #e91e63 100%);
  color: white;
  font-size: 0.9375rem;
  font-weight: 700;
  letter-spacing: 0.04em;
  text-decoration: none;
  text-transform: uppercase;
  margin-top: 0.5rem;
  box-shadow: 0 4px 14px rgba(194, 24, 91, 0.3);
  transition: ${tokens.transition};

  &:hover {
    box-shadow: 0 6px 20px rgba(194, 24, 91, 0.45);
  }
`;
