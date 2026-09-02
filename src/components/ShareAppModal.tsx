import React, { useState, useEffect } from 'react';
import {
  X,
  Share2,
  Copy,
  Check,
  ExternalLink,
  QrCode,
  Globe,
  MessageCircle,
  Send,
  Mail,
  Smartphone,
  Download,
  FileArchive,
  FileText,
} from 'lucide-react';

interface ShareAppModalProps {
  isOpen: boolean;
  onClose: () => void;
  onShowToast?: (msg: string) => void;
}

const PUBLIC_APP_URL = 'https://ais-pre-kkxi2png52sdw7ff4hdxly-705261795980.asia-southeast1.run.app';
const ZIP_DOWNLOAD_URL = '/citygrocer-complete-project.zip';
const PDF_ROADMAP_URL = '/citygrocer-roadmap.pdf';

export const ShareAppModal: React.FC<ShareAppModalProps> = ({
  isOpen,
  onClose,
  onShowToast,
}) => {
  const [copied, setCopied] = useState<boolean>(false);
  const [activeShareUrl, setActiveShareUrl] = useState<string>(PUBLIC_APP_URL);
  const [showQr, setShowQr] = useState<boolean>(false);

  useEffect(() => {
    // Dynamically detect current browser origin and pathname or fallback to active host
    if (typeof window !== 'undefined' && window.location) {
      const origin = window.location.origin;
      if (origin && !origin.includes('localhost')) {
        setActiveShareUrl(origin);
      } else {
        setActiveShareUrl(window.location.href);
      }
    }
  }, []);

  if (!isOpen) return null;

  const handleCopy = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(activeShareUrl);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = activeShareUrl;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
      }
      setCopied(true);
      onShowToast?.('Public link copied to clipboard!');
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'CityGrocer - Real-time Grocery Price Intelligence & Cart Optimizer',
          text: 'Compare grocery prices across city stores in Rupees (₹), track live aisle stock, and save up to 55% on your groceries!',
          url: activeShareUrl,
        });
      } catch (err) {
        // User cancelled or share failed
      }
    } else {
      handleCopy();
    }
  };

  const shareText = encodeURIComponent('Compare live grocery prices in ₹ INR and find the best deals in city stores: ');
  const encodedUrl = encodeURIComponent(activeShareUrl);

  const whatsappUrl = `https://api.whatsapp.com/send?text=${shareText}${encodedUrl}`;
  const telegramUrl = `https://t.me/share/url?url=${encodedUrl}&text=${shareText}`;
  const twitterUrl = `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${shareText}`;
  const mailUrl = `mailto:?subject=${encodeURIComponent('Check out CityGrocer - Live Price Comparison')}&body=${shareText}%0A${encodedUrl}`;

  // QR Code URL using quick chart API
  const qrCodeImgUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(activeShareUrl)}&bgcolor=ffffff&color=0f172a&margin=1`;

  return (
    <div
      id="share-app-modal-backdrop"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={onClose}
    >
      <div
        id="share-app-modal-content"
        className="bg-white rounded-3xl max-w-lg w-full shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-slate-100 bg-slate-50/50">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-600 text-white flex items-center justify-center shadow-md shadow-emerald-600/20">
              <Share2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-slate-900">Share Public Web Link</h2>
              <p className="text-xs text-slate-500">Anyone with this link can immediately open and use this website</p>
            </div>
          </div>
          <button
            id="close-share-modal-btn"
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-slate-600 rounded-xl hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5 overflow-y-auto">
          
          {/* Main Direct Public Link Box */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Public Direct Website Link
            </label>
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 bg-slate-50 p-2.5 rounded-2xl border border-slate-200 focus-within:border-emerald-500 focus-within:ring-2 focus-within:ring-emerald-500/20 transition-all">
              <div className="flex items-center gap-2 flex-1 min-w-0 px-2">
                <Globe className="w-4 h-4 text-emerald-600 shrink-0" />
                <input
                  id="public-share-link-input"
                  type="text"
                  readOnly
                  value={activeShareUrl}
                  onClick={(e) => (e.target as HTMLInputElement).select()}
                  className="w-full bg-transparent text-xs font-mono font-semibold text-slate-800 focus:outline-hidden select-all"
                />
              </div>

              <div className="flex items-center gap-1.5 shrink-0 pt-1 sm:pt-0 border-t sm:border-t-0 border-slate-200">
                <button
                  id="copy-public-link-btn"
                  onClick={handleCopy}
                  className={`flex items-center justify-center gap-1.5 px-4 py-2 text-xs font-bold rounded-xl transition-all shadow-xs ${
                    copied
                      ? 'bg-emerald-600 text-white shadow-emerald-600/25'
                      : 'bg-slate-900 hover:bg-slate-800 text-white'
                  }`}
                >
                  {copied ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                  <span>{copied ? 'Copied!' : 'Copy Link'}</span>
                </button>

                <a
                  id="open-in-tab-link-btn"
                  href={activeShareUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2 text-slate-600 hover:text-emerald-700 bg-white hover:bg-emerald-50 rounded-xl border border-slate-200 transition-colors"
                  title="Open live link directly in new tab"
                >
                  <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            </div>
          </div>

          {/* Quick Share Targets */}
          <div className="space-y-2">
            <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">
              Instant 1-Touch Sharing
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {/* WhatsApp */}
              <a
                id="share-target-whatsapp"
                href={whatsappUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-emerald-50 hover:bg-emerald-100 border border-emerald-200/80 text-emerald-800 transition-all hover:scale-[1.02] text-center group"
              >
                <div className="w-8 h-8 rounded-full bg-emerald-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                  <MessageCircle className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">WhatsApp</span>
                <span className="text-[10px] text-emerald-600 font-medium">Send message</span>
              </a>

              {/* Telegram */}
              <a
                id="share-target-telegram"
                href={telegramUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-sky-50 hover:bg-sky-100 border border-sky-200/80 text-sky-800 transition-all hover:scale-[1.02] text-center group"
              >
                <div className="w-8 h-8 rounded-full bg-sky-500 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                  <Send className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Telegram</span>
                <span className="text-[10px] text-sky-600 font-medium">Post to chat</span>
              </a>

              {/* Email */}
              <a
                id="share-target-email"
                href={mailUrl}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/80 text-indigo-800 transition-all hover:scale-[1.02] text-center group"
              >
                <div className="w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                  <Mail className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Email</span>
                <span className="text-[10px] text-indigo-600 font-medium">Send invite</span>
              </a>

              {/* Native Mobile Share */}
              <button
                id="share-target-device"
                onClick={handleNativeShare}
                className="flex flex-col items-center justify-center p-3 rounded-2xl bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 transition-all hover:scale-[1.02] text-center group"
              >
                <div className="w-8 h-8 rounded-full bg-slate-800 text-white flex items-center justify-center mb-1.5 shadow-xs group-hover:scale-110 transition-transform">
                  <Smartphone className="w-4 h-4" />
                </div>
                <span className="text-xs font-bold">Device Share</span>
                <span className="text-[10px] text-slate-500 font-medium">Apps / AirDrop</span>
              </button>
            </div>
          </div>

          {/* Direct ZIP Package & PDF Roadmap Download Box */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-emerald-50 to-teal-50/60 rounded-2xl p-4 border border-emerald-200/90 flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileArchive className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Project Source (.ZIP)</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    All datasets, HTML/CSS, React components, and Express API.
                  </p>
                </div>
              </div>

              <a
                id="download-project-zip-btn"
                href={ZIP_DOWNLOAD_URL}
                download="citygrocer-complete-project.zip"
                className="w-full flex items-center justify-center gap-2 py-2 px-3 bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99] text-white font-bold text-xs rounded-xl shadow-xs transition-all"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download .ZIP</span>
              </a>
            </div>

            <div className="bg-gradient-to-br from-indigo-50 to-blue-50/60 rounded-2xl p-4 border border-indigo-200/90 flex flex-col justify-between space-y-3">
              <div className="flex items-start gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-slate-900">Workflow & Roadmap (.PDF)</h3>
                  <p className="text-[11px] text-slate-600 mt-0.5 leading-snug">
                    7-phase plan, all component specs, schemas & REST API guide.
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <a
                  id="view-roadmap-pdf-btn"
                  href={PDF_ROADMAP_URL}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-800 border border-indigo-200 font-bold text-xs rounded-xl transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  <span>View PDF</span>
                </a>
                <a
                  id="download-roadmap-pdf-btn"
                  href={PDF_ROADMAP_URL}
                  download="citygrocer-roadmap.pdf"
                  className="flex-1 flex items-center justify-center gap-1.5 py-2 px-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs rounded-xl shadow-xs transition-all"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download PDF</span>
                </a>
              </div>
            </div>
          </div>

          {/* QR Code Toggle for Mobile Touch / Scanning */}
          <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <QrCode className="w-4 h-4 text-slate-700" />
                <span className="text-xs font-bold text-slate-800">Scan QR Code from Phone</span>
              </div>
              <button
                id="toggle-qr-code-btn"
                onClick={() => setShowQr(!showQr)}
                className="text-xs font-bold text-emerald-700 hover:text-emerald-800 underline underline-offset-2"
              >
                {showQr ? 'Hide QR Code' : 'Show QR Code'}
              </button>
            </div>

            {showQr && (
              <div className="flex flex-col items-center justify-center pt-2 pb-1 animate-in fade-in duration-200">
                <div className="p-3 bg-white rounded-2xl border border-slate-200 shadow-sm">
                  <img
                    src={qrCodeImgUrl}
                    alt="CityGrocer Public QR Code"
                    className="w-36 h-36 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                </div>
                <p className="text-[11px] text-slate-500 mt-2 text-center">
                  Point any phone camera or barcode scanner at this QR code to instantly open the website.
                </p>
              </div>
            )}
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5 text-emerald-700 font-semibold">
            <span className="w-2 h-2 rounded-full bg-emerald-500" />
            Live & Publicly Accessible
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold rounded-xl transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
