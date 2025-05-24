export default function Footer() {
  return (
    <footer className="bg-black/30 py-6 text-center text-sm text-gray-400 mt-12">
      © {new Date().getFullYear()} Your Cool App. All rights reserved.
    </footer>
  );
}
