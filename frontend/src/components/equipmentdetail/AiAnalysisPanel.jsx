import {
  Sparkles,
  TrendingUp,
  CheckCircle,
  BarChart3,
  Clock,
  Zap,
} from "lucide-react";

export default function AiAnalysisPanel({
  isAuthenticated,
  authReady,
  loadingAiAnalysis,
  refreshingAiAnalysis,
  onRefresh,
  aiAnalysisError,
  aiAnalysis,
  priceMeta,
  conditionMeta,
  localizedPriceReason,
  localizedConditionReason,
  formatDateTime,
}) {
  return (
    <div className="rounded-2xl border border-[1px] border-purple-200 bg-gradient-to-r from-purple-50 to-blue-50 p-5 shadow-sm">
      <div className="mb-4 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Sparkles size={20} className="text-purple-600" />
          <h3 className="text-lg font-semibold text-gray-900">
            AI Equipment Analyzer
          </h3>
        </div>
        {isAuthenticated && (
          <div>
            <button
              type="button"
              className="rounded-lg border border-purple-200 px-3 py-1.5 text-xs font-semibold text-purple-700 transition hover:bg-purple-50 disabled:cursor-not-allowed disabled:opacity-60"
              onClick={onRefresh}
              disabled={loadingAiAnalysis || refreshingAiAnalysis}
            >
              {refreshingAiAnalysis ? "Refreshing..." : "Refresh Analysis"}
            </button>
          </div>
        )}
      </div>

      {!authReady ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Preparing AI analyzer...
        </p>
      ) : !isAuthenticated ? (
        <p className="rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-700">
          Please log in to view AI price and condition analysis.
        </p>
      ) : loadingAiAnalysis ? (
        <div className="flex items-center justify-center p-8">
          <div className="text-center">
            <Sparkles
              className="mx-auto mb-2 animate-pulse text-purple-500"
              size={32}
            />
            <p className="text-sm text-gray-600">Generating AI insights...</p>
          </div>
        </div>
      ) : aiAnalysisError ? (
        <p className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
          {aiAnalysisError}
        </p>
      ) : !aiAnalysis ? (
        <p className="rounded-xl border border-dashed border-gray-200 bg-gray-50 p-4 text-sm text-gray-500">
          Analysis unavailable for now. Try refreshing.
        </p>
      ) : (
        <div className="space-y-4">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div
              className={`rounded-xl border border-[1px] border-gray-100 p-4 ${priceMeta.bgClass}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <TrendingUp size={18} className={priceMeta.className} />
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Price Analysis
                </p>
              </div>
              <p
                className={`mt-1 text-base font-semibold ${priceMeta.className}`}
              >
                {priceMeta.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {localizedPriceReason ||
                  "The market comparison could not be generated."}
              </p>
            </div>

            <div
              className={`rounded-xl border border-[1px] border-gray-100 p-4 ${conditionMeta.bgClass}`}
            >
              <div className="mb-2 flex items-center gap-2">
                <CheckCircle size={18} className={conditionMeta.className} />
                <p className="text-xs font-semibold uppercase tracking-wide text-gray-500">
                  Condition Estimate
                </p>
              </div>
              <p
                className={`mt-1 text-base font-semibold ${conditionMeta.className}`}
              >
                {conditionMeta.title}
              </p>
              <p className="mt-2 text-sm leading-relaxed text-gray-700">
                {localizedConditionReason ||
                  "The condition estimate is unavailable."}
              </p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 border-t border-gray-200 pt-2 text-xs text-gray-500">
            <span className="flex items-center gap-1">
              <BarChart3 size={12} />
              Confidence: {Number(aiAnalysis?.confidence || 0)}%
            </span>
            <span className="flex items-center gap-1">
              <Clock size={12} />
              Last analyzed: {formatDateTime(aiAnalysis?.analyzedAt, "N/A")}
            </span>
            <span className="flex items-center gap-1">
              <Zap size={12} />
              Model: {aiAnalysis?.model || "gemini-1.5-flash"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
