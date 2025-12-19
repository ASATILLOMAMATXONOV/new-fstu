import { Link } from "react-router-dom";
import {
  FileText,
  PlayCircle,
  MessageCircle,
  Heart,
  LayoutGrid,
} from "lucide-react";

import "../../assets/styles/FloatingToolbar.css";

export default function FloatingToolbar() {
  return (
    <div className="floating-toolbar">
      <Link to="/docs" className="toolbar-item">
        <span className="label">Documentation</span>
        <FileText size={18} />
      </Link>

      <Link to="/video" className="toolbar-item">
        <span className="label">Video</span>
        <PlayCircle size={18} />
      </Link>

      <Link to="/chat" className="toolbar-item">
        <span className="label">Chat</span>
        <MessageCircle size={18} />
      </Link>

      <Link to="/favorites" className="toolbar-item">
        <span className="label">Favorites</span>
        <Heart size={18} />
      </Link>

      {/* BOSHQA SAHIFAGA O‘TISH ICONI */}
      <Link to="/twopages" className="toolbar-item switch-item">
        <span className="label">Boshqa ko‘rinish</span>
        <LayoutGrid size={18} />
      </Link>
    </div>
  );
}
