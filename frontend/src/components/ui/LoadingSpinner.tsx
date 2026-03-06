export default function LoadingSpinner() {
    return (
        <div className="flex items-center justify-center w-full h-full min-h-[200px]">
            <div className="relative">
                <div className="w-12 h-12 rounded-full border-2 border-purple-500/20"></div>
                <div className="w-12 h-12 rounded-full border-2 border-transparent border-t-purple-500 animate-spin absolute top-0 left-0"></div>
            </div>
        </div>
    );
}