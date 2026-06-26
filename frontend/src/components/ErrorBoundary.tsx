import React, { Component, ErrorInfo, ReactNode } from "react";

interface Props {
  children?: ReactNode;
}

interface State {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  };

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null };
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
    this.setState({ errorInfo });
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-slate-50 p-6 text-center select-none font-sans">
          <div className="w-full max-w-md rounded-3xl border border-slate-200 bg-white p-8 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-full h-1.5 bg-rose-500" />
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold text-rose-600 block mb-2">
              Đã xảy ra lỗi hệ thống
            </span>
            <h1 className="text-lg font-black text-slate-850 mb-3">
              Không thể tải giao diện trang
            </h1>
            <p className="text-xs text-slate-500 mb-6 leading-relaxed">
              Ứng dụng gặp sự cố không mong muốn. Vui lòng tải lại trang hoặc liên hệ quản trị viên nếu lỗi tiếp tục diễn ra.
            </p>
            
            <div className="mb-6 rounded-2xl bg-slate-50 p-4 text-left border border-slate-150 max-h-[160px] overflow-auto scrollbar-thin">
              <p className="text-xs font-mono font-bold text-rose-600 leading-tight">
                {this.state.error?.toString()}
              </p>
              {this.state.errorInfo && (
                <pre className="mt-2 text-[9px] font-mono text-slate-400 whitespace-pre-wrap leading-normal">
                  {this.state.errorInfo.componentStack}
                </pre>
              )}
            </div>

            <button
              type="button"
              onClick={() => window.location.reload()}
              className="w-full rounded-xl bg-slate-900 py-3 text-xs font-bold text-white hover:bg-slate-800 transition active:scale-95 cursor-pointer shadow-sm"
              style={{ minHeight: "42px" }}
            >
              Tải lại trang
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
