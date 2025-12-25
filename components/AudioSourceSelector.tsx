
import React, { useState, useEffect } from 'react';

interface Props {
  selectedId: string;
  onSelect: (id: string) => void;
}

const AudioSourceSelector: React.FC<Props> = ({ selectedId, onSelect }) => {
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);

  useEffect(() => {
    const getDevices = async () => {
      try {
        const devs = await navigator.mediaDevices.enumerateDevices();
        const audioInputs = devs.filter(d => d.kind === 'audioinput');
        setDevices(audioInputs);
        if (!selectedId && audioInputs.length > 0) {
          onSelect(audioInputs[0].deviceId);
        }
      } catch (e) {
        console.error("Error getting devices", e);
      }
    };

    getDevices();
    navigator.mediaDevices.ondevicechange = getDevices;
  }, [selectedId, onSelect]);

  return (
    <div className="flex flex-col gap-2">
      <label className="text-sm font-semibold text-slate-400 uppercase tracking-wider">
        <i className="fas fa-microphone mr-2"></i> Audio Input Source
      </label>
      <select
        value={selectedId}
        onChange={(e) => onSelect(e.target.value)}
        className="bg-slate-800 border border-slate-700 text-white rounded-lg p-2.5 focus:ring-blue-500 focus:border-blue-500 outline-none transition-all"
      >
        {devices.map((device) => (
          <option key={device.deviceId} value={device.deviceId}>
            {device.label || `Microphone ${device.deviceId.slice(0, 5)}`}
          </option>
        ))}
      </select>
    </div>
  );
};

export default AudioSourceSelector;
