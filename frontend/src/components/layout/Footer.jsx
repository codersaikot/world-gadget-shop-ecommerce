import { Link } from 'react-router-dom';
import { MdElectricalServices } from 'react-icons/md';
import { FiFacebook, FiInstagram, FiTwitter, FiYoutube, FiMapPin, FiPhone, FiMail } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="bg-gray-900 text-gray-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <MdElectricalServices className="text-white text-lg" />
              </div>
              <span className="font-display font-bold text-white text-lg">World Gadget Shop</span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed mb-4">
              Bangladesh's premier destination for the latest gadgets, smartphones, laptops, and accessories at the best prices.
            </p>
            <div className="flex gap-3">
              {[FiFacebook, FiInstagram, FiTwitter, FiYoutube].map((Icon, i) => (
                <a key={i} href="#" className="w-8 h-8 bg-gray-800 hover:bg-blue-600 rounded-full flex items-center justify-center transition-colors">
                  <Icon className="text-sm" />
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h3 className="font-semibold text-white mb-4">Quick Links</h3>
            <ul className="space-y-2 text-sm">
              {[['All Products', '/products'], ['Smartphones', '/products?category=smartphones'], ['Laptops', '/products?category=laptops'], ['Headphones', '/products?category=headphones'], ['Featured Deals', '/products?featured=true']].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Customer Service */}
          <div>
            <h3 className="font-semibold text-white mb-4">Customer Service</h3>
            <ul className="space-y-2 text-sm">
              {[['My Account', '/profile'], ['My Orders', '/my-orders'], ['Wishlist', '/wishlist'], ['Track Order', '/my-orders'], ['Login / Register', '/login']].map(([label, path]) => (
                <li key={label}>
                  <Link to={path} className="hover:text-blue-400 transition-colors">{label}</Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h3 className="font-semibold text-white mb-4">Contact Us</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <FiMapPin className="mt-0.5 shrink-0 text-blue-400" />
                <span>123 Tech Street, Motijheel, Dhaka-1000, Bangladesh</span>
              </li>
              <li className="flex items-center gap-2">
                <FiPhone className="shrink-0 text-blue-400" />
                <span>+880 1700-000000</span>
              </li>
              <li className="flex items-center gap-2">
                <FiMail className="shrink-0 text-blue-400" />
                <span>support@worldgadgetshop.com</span>
              </li>
            </ul>
            <div className="mt-4 p-3 bg-gray-800 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Payment Methods</p>
              <div className="flex gap-2 text-xs font-medium">
                <span className="bg-green-800 text-green-300 px-2 py-0.5 rounded">bKash</span>
                <span className="bg-orange-800 text-orange-300 px-2 py-0.5 rounded">Nagad</span>
                <span className="bg-blue-800 text-blue-300 px-2 py-0.5 rounded">COD</span>
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-800 mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-sm text-gray-500">
          <p>© 2026 World Gadget Shop. All rights reserved.</p>
          <p>Made with ❤️ in Bangladesh</p>
        </div>
      </div>
    </footer>
  );
}
