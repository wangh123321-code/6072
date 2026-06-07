import React, { useState } from 'react';
import { ChevronDown, Plus, Trash2, Edit3 } from 'lucide-react';
import { useCatStore } from '@/store';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input, Select } from '@/components/common/Input';
import { formatAge } from '@/utils/dateUtils';
import { BREED_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';

export const CatSelector: React.FC = () => {
  const { cats, currentCatId, setCurrentCat, addCat, deleteCat, updateCat } = useCatStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  
  const [formData, setFormData] = useState({
    name: '',
    breed: '英国短毛猫',
    birthday: '',
    gender: 'male' as 'male' | 'female',
    avatar: '',
  });

  const currentCat = cats.find(c => c.id === currentCatId);

  const handleAddCat = () => {
    setFormData({
      name: '',
      breed: '英国短毛猫',
      birthday: '',
      gender: 'male',
      avatar: `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20${formData.breed}%20cat%20portrait&image_size=square`,
    });
    setEditingCat(null);
    setIsAddModalOpen(true);
  };

  const handleEditCat = (cat: typeof cats[0]) => {
    setFormData({
      name: cat.name,
      breed: cat.breed,
      birthday: cat.birthday,
      gender: cat.gender,
      avatar: cat.avatar,
    });
    setEditingCat(cat.id);
    setIsAddModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.birthday) return;

    if (editingCat) {
      await updateCat(editingCat, formData);
    } else {
      const avatarUrl = formData.avatar || `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20${encodeURIComponent(formData.breed)}%20cat%20portrait&image_size=square`;
      await addCat({ ...formData, avatar: avatarUrl });
    }
    
    setIsAddModalOpen(false);
  };

  const handleDeleteCat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('确定要删除这只猫咪的所有档案吗？此操作不可恢复。')) {
      await deleteCat(id);
    }
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 min-w-[280px]"
      >
        {currentCat && (
          <>
            <img
              src={currentCat.avatar}
              alt={currentCat.name}
              className="w-12 h-12 rounded-full object-cover border-3 border-primary-100"
            />
            <div className="flex-1 text-left">
              <div className="font-display text-lg text-gray-800">{currentCat.name}</div>
              <div className="text-xs text-gray-500">
                {currentCat.breed} · {formatAge(currentCat.birthday)}
              </div>
            </div>
          </>
        )}
        <ChevronDown
          className={cn(
            'w-5 h-5 text-gray-400 transition-transform duration-200',
            isDropdownOpen && 'rotate-180'
          )}
        />
      </button>

      {isDropdownOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsDropdownOpen(false)}
          />
          <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-card shadow-xl z-20 overflow-hidden animate-fade-in">
            <div className="max-h-80 overflow-y-auto">
              {cats.map((cat) => (
                <div
                  key={cat.id}
                  onClick={() => {
                    setCurrentCat(cat.id);
                    setIsDropdownOpen(false);
                  }}
                  className={cn(
                    'flex items-center gap-3 px-4 py-3 hover:bg-warm-50 cursor-pointer transition-colors',
                    cat.id === currentCatId && 'bg-primary-50'
                  )}
                >
                  <img
                    src={cat.avatar}
                    alt={cat.name}
                    className="w-10 h-10 rounded-full object-cover"
                  />
                  <div className="flex-1 text-left">
                    <div className="font-medium text-gray-800">{cat.name}</div>
                    <div className="text-xs text-gray-500">
                      {cat.breed} · {formatAge(cat.birthday)}
                    </div>
                  </div>
                  <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleEditCat(cat);
                      }}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500 transition-colors"
                    >
                      <Edit3 className="w-4 h-4" />
                    </button>
                    <button
                      onClick={(e) => handleDeleteCat(cat.id, e)}
                      className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-danger-500 transition-colors"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <div className="p-3 border-t border-gray-100">
              <Button
                variant="secondary"
                size="sm"
                className="w-full justify-center gap-2"
                onClick={handleAddCat}
              >
                <Plus className="w-4 h-4" />
                添加新猫咪
              </Button>
            </div>
          </div>
        </>
      )}

      <Modal
        isOpen={isAddModalOpen}
        onClose={() => setIsAddModalOpen(false)}
        title={editingCat ? '编辑猫咪信息' : '添加新猫咪'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="猫咪名字"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            placeholder="请输入猫咪名字"
            required
          />
          
          <Select
            label="品种"
            value={formData.breed}
            onChange={(e) => setFormData({ ...formData, breed: e.target.value })}
            options={BREED_OPTIONS.map(b => ({ value: b, label: b }))}
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="出生日期"
              type="date"
              value={formData.birthday}
              onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
              required
            />
            
            <Select
              label="性别"
              value={formData.gender}
              onChange={(e) => setFormData({ ...formData, gender: e.target.value as 'male' | 'female' })}
              options={[
                { value: 'male', label: '公猫' },
                { value: 'female', label: '母猫' },
              ]}
            />
          </div>
          
          <Input
            label="头像链接（可选）"
            value={formData.avatar}
            onChange={(e) => setFormData({ ...formData, avatar: e.target.value })}
            placeholder="留空将使用默认头像"
          />
          
          {formData.avatar && (
            <div className="flex justify-center">
              <img
                src={formData.avatar}
                alt="预览"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
              />
            </div>
          )}
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => setIsAddModalOpen(false)}
            >
              取消
            </Button>
            <Button type="submit" className="flex-1">
              {editingCat ? '保存修改' : '添加猫咪'}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
