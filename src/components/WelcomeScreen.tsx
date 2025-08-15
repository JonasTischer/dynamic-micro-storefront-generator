export function WelcomeScreen() {
  return (
    <div className="text-center">
      <h1 className="text-5xl md:text-6xl font-bold text-gray-900 flex items-center justify-center gap-3 mb-0 leading-tight" style={{ fontFamily: '"Comic Sans MS", cursive' }}>
        Build your shop with
        <img src="/logo2.png" alt="shop" className="h-64 w-auto inline-block align-middle" />
      </h1>
      <p className="text-xl text-gray-600 mt-0 mb-8" style={{ fontFamily: '"Comic Sans MS", cursive' }}>
        Pop up. Snap up. Sell out. 💖
      </p>
    </div>
  );
}