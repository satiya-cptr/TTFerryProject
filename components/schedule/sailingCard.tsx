import { Sailing } from '@/lib/types/sailingTypes';
import { Vessel } from '@/lib/types/vesselTypes';

// card to display individual sailing information
// TODO: use new design

interface SailingCardProps {
  sailing: Sailing;
  vessel?: Vessel;
}

export default function SailingCard({ sailing, vessel }: SailingCardProps) {
  const departureTime = sailing.departureTime.toDate();
  const arrivalTime = sailing.arrivalTime.toDate();

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' });
  };

  return (
    <div className="bg-light-surface border border-blue-ink/50 rounded-[20px] py-5 px-6 hover:border-gray-300 hover:shadow-sm transition-all">
      <div className="flex items-start justify-between">
        {/* time and route */}
        <div className="flex-1">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-2xl font-extrabold text-blue-ink">
              {formatTime(departureTime)}
            </span>
            <span className="text-gray-400">→</span>
            <span className="text-lg font-bold text-blue-ink/60">
              {formatTime(arrivalTime)}
            </span>
          </div>

          <div className="flex items-center gap-2 text-sm text-blue-ink/60 mb-1">
            <span className="font-bold">{sailing.departurePort}</span>
            <span>→</span>
            <span className="font-bold">{sailing.arrivalPort}</span>
          </div>

          <div className="text-sm font-medium text-blue-ink/60">
            {vessel?.name || sailing.vesselCallsign}
          </div>
        </div>

        {/* status and capacity */}
        <div className="text-right">
          <div
            className={`
              inline-block px-3 py-1 rounded-full text-xs font-medium mb-2
              ${sailing.status === 'scheduled' ? 'bg-green-100 text-green-800' : ''}
              ${sailing.status === 'departed' ? 'bg-blue-100 text-blue-800' : ''}
              ${sailing.status === 'arrived' ? 'bg-gray-100 text-gray-800' : ''}
              ${sailing.status === 'cancelled' ? 'bg-red-100 text-red-800' : ''}
              ${sailing.status === 'delayed' ? 'bg-yellow-100 text-yellow-800' : ''}
            `}
          >
            {sailing.status.charAt(0).toUpperCase() + sailing.status.slice(1)}
          </div>

          <div className="text-xs text-blue-ink/60">
            <div>Premium: {sailing.availableCapacity.premium}</div>
            <div>Economy: {sailing.availableCapacity.economy}</div>
            <div>Vehicles: {sailing.availableCapacity.laneMeters.toFixed(0)}m</div>
          </div>
        </div>
      </div>

      {sailing.notes && (
        <div className="mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-600">{sailing.notes}</p>
        </div>
      )}
    </div>
  );
}