import type { TabId } from '../../types';

const TABS: { id: TabId; label: string }[] = [
  { id: 'compare', label: '原图 / 重建图' },
  { id: 'dct', label: 'DCT 系数' },
  { id: 'quantize', label: '量化过程' },
  { id: 'encode', label: '编码细节' },
  { id: 'rd', label: 'R-D 曲线' },
];

interface TabBarProps {
  activeTab: TabId;
  onTabChange: (tab: TabId) => void;
}

export function TabBar({ activeTab, onTabChange }: TabBarProps) {
  return (
    <div className="tab-bar" role="tablist">
      {TABS.map((tab) => {
        const isActive = activeTab === tab.id;
        return (
          <button
            key={tab.id}
            role="tab"
            aria-selected={isActive}
            onClick={() => onTabChange(tab.id)}
            className={`tab-bar__btn ${isActive ? 'tab-bar__btn--active' : ''}`}
          >
            <span className="tab-bar__label">{tab.label}</span>
          </button>
        );
      })}
    </div>
  );
}

export { TABS };
