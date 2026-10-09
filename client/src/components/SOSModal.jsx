import React from 'react';
import { Phone, ShieldAlert, X, AlertTriangle, Building2, PhoneCall } from 'lucide-react';

const SOSModal = ({ isOpen, onClose }) => {
  if (!isOpen) return null;

  // The 3 major calling options requested by user
  const contacts = [
    {
      id: 'security',
      title: 'SAIT Campus Security',
      phone: '080-23648444',
      telNumber: '08023648444',
      desc: 'Sambhram Main Gate & Immediate Campus Patrol',
      badge: 'SAIT Security (Primary)',
      bg: 'bg-red-50 hover:bg-red-100/80 border-red-200 text-red-900',
      btnColor: 'bg-red-600 hover:bg-red-700 text-white'
    },
    {
      id: 'hospital',
      title: 'Nearby Hospital & SAIT Ambulance',
      phone: '080-23648455',
      telNumber: '08023648455',
      alt: '108',
      desc: 'Sambhram First Aid & Immediate Hospital Dispatch',
      badge: 'Emergency Hospital / 108',
      bg: 'bg-emerald-50 hover:bg-emerald-100/80 border-emerald-200 text-emerald-900',
      btnColor: 'bg-emerald-600 hover:bg-emerald-700 text-white'
    },
    {
      id: 'police',
      title: 'Nearby Police Station (Vidyaranyapura)',
      phone: '080-22942526',
      telNumber: '08022942526',
      alt: '112',
      desc: 'Vidyaranyapura Local Police Dispatch (0.8 km)',
      badge: 'Police Dispatch / 112',
      bg: 'bg-blue-50 hover:bg-blue-100/80 border-blue-200 text-blue-900',
      btnColor: 'bg-blue-600 hover:bg-blue-700 text-white'
    },
    {
      id: 'women',
      title: 'Karnataka Women Helpline (Pink Ride SOS)',
      phone: '1091',
      telNumber: '1091',
      desc: '24x7 Dedicated Women Safety & Rapid Patrol',
      badge: 'Pink Safety / 1091',
      bg: 'bg-pink-50 hover:bg-pink-100/80 border-pink-200 text-pink-900',
      btnColor: 'bg-pink-600 hover:bg-pink-700 text-white'
    }
  ];

  const handleCall = (telNumber) => {
    window.location.href = `tel:${telNumber}`;
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in font-sans">
      <div className="bg-white rounded-3xl max-w-sm w-full p-5 shadow-2xl border border-red-200 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
        >
          <X className="w-5 h-5" />
        </button>

        {/* SOS Header */}
        <div className="flex items-center space-x-3 mb-3">
          <div className="w-12 h-12 bg-red-600 text-white rounded-2xl flex items-center justify-center shadow-lg animate-pulse shrink-0">
            <ShieldAlert className="w-7 h-7" />
          </div>
          <div>
            <h3 className="text-xl font-black text-gray-900">SAIT Emergency SOS</h3>
            <p className="text-xs text-red-600 font-bold">Tap any card to dial immediately</p>
          </div>
        </div>

        <p className="text-xs text-gray-500 mb-3.5 leading-relaxed">
          Direct emergency lines for <strong>Sambhram Institute of Technology (SAIT)</strong>. Pressing any option directly dials the phone call:
        </p>

        {/* 3 Major Call Options (Direct Click-to-Call) */}
        <div className="space-y-2.5 mb-4">
          {contacts.map((c) => (
            <div
              key={c.id}
              onClick={() => handleCall(c.telNumber)}
              className={`p-3.5 rounded-2xl border cursor-pointer transition-all active:scale-98 shadow-xs flex items-center justify-between ${c.bg}`}
            >
              <div className="pr-2 flex-1">
                <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded-md bg-white/90 shadow-xs mb-1 inline-block">
                  {c.badge}
                </span>
                <p className="font-extrabold text-sm text-gray-900 leading-tight">
                  {c.title}
                </p>
                <p className="text-[11px] text-gray-600 mt-0.5 font-mono font-bold">
                  📞 {c.phone} {c.alt ? `(or ${c.alt})` : ''}
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  handleCall(c.telNumber);
                }}
                className={`px-3 py-2 rounded-xl text-xs font-black shadow-sm flex items-center space-x-1 shrink-0 ${c.btnColor}`}
              >
                <PhoneCall className="w-3.5 h-3.5" />
                <span>Call</span>
              </button>
            </div>
          ))}
        </div>

        {/* Quick notice */}
        <div className="bg-amber-50 rounded-2xl p-2.5 border border-amber-200 flex items-start space-x-2">
          <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
          <p className="text-[10px] text-amber-900 font-medium leading-tight">
            Campus security will automatically receive your live location coordinates during an active ride.
          </p>
        </div>
      </div>
    </div>
  );
};

export default SOSModal;
