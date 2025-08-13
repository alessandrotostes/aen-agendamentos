export default function EmptyState({
  message,
  icon = "📋",
  actionText,
  onAction,
}: {
  message: string;
  icon?: string;
  actionText?: string;
  onAction?: () => void;
}) {
  return (
    <div className="text-center py-12">
      <div className="text-6xl mb-4 opacity-20">{icon}</div>
      <p className="text-gray-500 mb-4">{message}</p>
      {actionText && onAction && (
        <button
          onClick={onAction}
          className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-teal-500 to-indigo-400 text-white text-sm font-medium rounded-lg hover:from-teal-600 hover:to-indigo-500 transition-all duration-200 hover:scale-105 shadow-lg"
        >
          {actionText}
        </button>
      )}
    </div>
  );
}
