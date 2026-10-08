import React from 'react';
import { Phone, ShieldAlert, X, AlertTriangle, Building2, PhoneCall } from 'lucide-react';

const SOSModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  const contacts = [
    {
      title: 'SAIT Campus Security',
      phone: '080-23648444',
      altPhone: '+91 94480 92345',
      desc: 'Sambhram Institute Main Gate & Security Patrol',
      badge: 'SAIT Security',
      color: 'bg-red-50 text-red-700 border-red-200'
    },
    {
      title: 'Vidyaranyapura Police Station',
      phone: '080-22942526',
      altPhone: '112',
      desc: 'Nearest Police Station to SAIT Campus',
      badge: 'Police Dispatch',
      color: 'bg-blue-50 text-blue-700 border-blue-200'
    },
    {
      title: 'SAIT Ambulance & Medical Health',
      phone: '080-23648455',
      altPhone: '108',
      desc: 'Sambhram First Aid & Immediate Hospital Ambulance',
      badge: 'Ambulance',
      color: 'bg-emerald-50 text-emerald-700 border-emerald-200'
    },
    {
      title: 'Women Safety Helpline',
      phone: '1091',
      altPhone: '112',
      desc: 'Karnataka 24x7 Women Safety & SOS Dispatch',
      badge: 'Pink SOS',
      color: 'bg-pink-50 text-pink-700 border-pink-200'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl max-w-sm w-full p-6 shadow-2xl border border-red-100 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center shadow-inner">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">SAIT Campus SOS</h3>
            <p className="text-xs text-red-600 font-bold">Emergency Quick Dispatch</p>
          </div>
        </div>

        <p className="text-xs text-gray-600 mb-4 leading-relaxed">
          Emergency contacts for <strong>Sambhram Institute of Technology (SAIT)</strong> and local Bengaluru emergency authorities:
        </p>

        <div className="space-y-2.5 mb-4">
          {contacts.map((c, idx) => (
            <div
              key={idx}
              className={`p-3.5 rounded-2xl border ${c.color} flex flex-col justify-between`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-[10px] font-black uppercase px-2 py-0.2 rounded-md bg-white/80 shadow-xs mb-1 inline-block">
                    {c.badge}
                  </span>
                  <p className="font-extrabold text-sm text-gray-900">{c.title}</p>
                  <p className="text-[11px] text-gray-600">{c.desc}</p>
                </div>
              </div>

              <div className="mt-2.5 pt-2 border-t border-black/5 flex items-center justify-between">
                <span className="font-mono font-black text-sm text-gray-900">
                  📞 {c.phone}
                </span>

                <a
                  href={`tel:${c.phone}`}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-700 text-white rounded-xl text-xs font-black shadow-sm flex items-center space-x-1 active:scale-95 transition-all"
                >
                  <PhoneCall className="w-3.5 h-3.5" />
                  <span>Call Now</span>
                </a>
              </div>
            </div>
          ))}
        </div>

        <div className="bg-amber-50 rounded-2xl p-3 border border-amber-200 flex items-start space-x-2.5">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[11px] text-amber-900 leading-snug">
            Your live GPS location and captain vehicle number are immediately logged for SAIT Security dispatch.
          </p>
        </div>

        <button
          onClick={onClose}
          className="w-full mt-4 py-3 bg-gray-900 hover:bg-black text-white font-bold rounded-2xl text-xs"
        >
          Close Emergency Menu
        </button>
      </div>
    </div>
  );
};

export default SOSModal;
