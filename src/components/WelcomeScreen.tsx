export function WelcomeScreen() {
  return (
    <div className="text-center">
      <h1 className="text-6xl font-bold text-gray-900 flex items-center justify-center gap-4" style={{ fontFamily: '"Comic Sans MS", cursive' }}>
        Build your shop with
        <img src="/logo2.png" alt="shop" className="h-72 w-auto inline-block" />


      </h1>
      <p className="text-xl text-gray-600 mb-12" style={{ fontFamily: '"Comic Sans MS", cursive' }}>
        Pop up. Snap up. Sell out. 💖
      </p>
    </div>
  );
}