import React, { useState, useRef } from 'react';
import { ChevronDown, Plus, Trash2, Edit3, Upload, X, Check } from 'lucide-react';
import { useCatStore } from '@/store';
import { Button } from '@/components/common/Button';
import { Modal } from '@/components/common/Modal';
import { Input, Select } from '@/components/common/Input';
import { formatAge } from '@/utils/dateUtils';
import { BREED_OPTIONS } from '@/types';
import { cn } from '@/lib/utils';
import type { Cat, CatInput } from '@/types';

export interface CatSelectorProps {
  showActions?: boolean;
  showAddButton?: boolean;
  className?: string;
  onCatChange?: (catId: string) => void;
}

interface FormErrors {
  name?: string;
  breed?: string;
  birthday?: string;
  gender?: string;
  avatar?: string;
}

const MAX_AVATAR_SIZE = 5 * 1024 * 1024;
const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];

const validateForm = (data: Partial<CatInput>): FormErrors => {
  const errors: FormErrors = {};

  if (!data.name?.trim()) {
    errors.name = '请输入猫咪名字';
  } else if (data.name.length > 20) {
    errors.name = '名字长度不能超过20个字符';
  } else if (data.name.length < 1) {
    errors.name = '名字至少需要1个字符';
  }

  if (!data.breed) {
    errors.breed = '请选择猫咪品种';
  } else if (!BREED_OPTIONS.includes(data.breed as any)) {
    errors.breed = '请选择有效的品种';
  }

  if (!data.birthday) {
    errors.birthday = '请选择出生日期';
  } else {
    const birthDate = new Date(data.birthday);
    const today = new Date();
    if (birthDate > today) {
      errors.birthday = '出生日期不能晚于今天';
    }
    const maxDate = new Date();
    maxDate.setFullYear(maxDate.getFullYear() - 30);
    if (birthDate < maxDate) {
      errors.birthday = '出生日期不能早于30年前';
    }
  }

  if (!data.gender) {
    errors.gender = '请选择性别';
  } else if (!['male', 'female'].includes(data.gender)) {
    errors.gender = '请选择有效的性别';
  }

  return errors;
};

const generateDefaultAvatar = (breed: string): string => {
  return `https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=cute%20${encodeURIComponent(breed)}%20cat%20portrait%20round%20face%20big%20eyes&image_size=square`;
};

export const CatSelector: React.FC<CatSelectorProps> = ({
  showActions = true,
  showAddButton = true,
  className,
  onCatChange,
}) => {
  const { cats, currentCatId, setCurrentCat, addCat, deleteCat, updateCat } = useCatStore();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCat, setEditingCat] = useState<string | null>(null);
  const [formErrors, setFormErrors] = useState<FormErrors>({});
  const [avatarPreview, setAvatarPreview] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [formData, setFormData] = useState<CatInput>({
    name: '',
    breed: '英国短毛猫',
    birthday: '',
    gender: 'male',
    avatar: '',
  });

  const currentCat = cats.find(c => c.id === currentCatId);

  const resetForm = () => {
    setFormData({
      name: '',
      breed: '英国短毛猫',
      birthday: '',
      gender: 'male',
      avatar: '',
    });
    setFormErrors({});
    setAvatarPreview('');
    setEditingCat(null);
  };

  const handleAddCat = () => {
    resetForm();
    setFormData(prev => ({ ...prev, avatar: generateDefaultAvatar(prev.breed) }));
    setIsModalOpen(true);
  };

  const handleEditCat = (cat: Cat, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setFormData({
      name: cat.name,
      breed: cat.breed,
      birthday: cat.birthday,
      gender: cat.gender,
      avatar: cat.avatar,
    });
    setAvatarPreview(cat.avatar);
    setEditingCat(cat.id);
    setFormErrors({});
    setIsModalOpen(true);
  };

  const handleSelectCat = (catId: string) => {
    setCurrentCat(catId);
    setIsDropdownOpen(false);
    onCatChange?.(catId);
  };

  const handleDeleteCat = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    const cat = cats.find(c => c.id === id);
    if (!cat) return;
    
    if (confirm(`确定要删除猫咪"${cat.name}"的所有档案吗？此操作将删除该猫咪的所有健康记录，且不可恢复。`)) {
      await deleteCat(id);
      if (isDropdownOpen && cats.length <= 1) {
        setIsDropdownOpen(false);
      }
    }
  };

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
      setFormErrors(prev => ({ ...prev, avatar: '只支持 JPG、PNG、GIF、WebP 格式的图片' }));
      return;
    }

    if (file.size > MAX_AVATAR_SIZE) {
      setFormErrors(prev => ({ ...prev, avatar: '图片大小不能超过 5MB' }));
      return;
    }

    const reader = new FileReader();
    reader.onload = (event) => {
      const result = event.target?.result as string;
      setAvatarPreview(result);
      setFormData(prev => ({ ...prev, avatar: result }));
      setFormErrors(prev => {
        const { avatar, ...rest } = prev;
        return rest;
      });
    };
    reader.onerror = () => {
      setFormErrors(prev => ({ ...prev, avatar: '图片读取失败，请重试' }));
    };
    reader.readAsDataURL(file);
  };

  const handleRemoveAvatar = () => {
    setAvatarPreview('');
    setFormData(prev => ({ ...prev, avatar: generateDefaultAvatar(prev.breed) }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    const errors = validateForm(formData);
    setFormErrors(errors);
    
    if (Object.keys(errors).length > 0) {
      return;
    }

    const avatarToUse = formData.avatar || generateDefaultAvatar(formData.breed);

    if (editingCat) {
      await updateCat(editingCat, { ...formData, avatar: avatarToUse });
    } else {
      await addCat({ ...formData, avatar: avatarToUse });
    }
    
    setIsModalOpen(false);
    resetForm();
  };

  const handleInputChange = (field: keyof CatInput, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    if (formErrors[field as keyof FormErrors]) {
      setFormErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[field as keyof FormErrors];
        return newErrors;
      });
    }

    if (field === 'breed' && !avatarPreview && !formData.avatar.startsWith('data:')) {
      setFormData(prev => ({ ...prev, avatar: generateDefaultAvatar(value) }));
    }
  };

  return (
    <div className={cn('relative', className)}>
      <button
        onClick={() => setIsDropdownOpen(!isDropdownOpen)}
        className="flex items-center gap-3 px-4 py-3 bg-white rounded-card shadow-card hover:shadow-card-hover transition-all duration-300 min-w-[280px]"
        aria-label={currentCat ? `当前猫咪：${currentCat.name}，点击切换` : '选择猫咪'}
        aria-expanded={isDropdownOpen}
        aria-haspopup="listbox"
      >
        {currentCat ? (
          <>
            <img
              src={currentCat.avatar}
              alt={currentCat.name}
              className="w-12 h-12 rounded-full object-cover border-3 border-primary-100"
              loading="lazy"
            />
            <div className="flex-1 text-left">
              <div className="font-display text-lg text-gray-800">{currentCat.name}</div>
              <div className="text-xs text-gray-500">
                {currentCat.breed} · {formatAge(currentCat.birthday)}
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 text-left text-gray-400">暂无猫咪档案</div>
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
            aria-hidden="true"
          />
          <div 
            className="absolute top-full left-0 right-0 mt-2 bg-white rounded-card shadow-xl z-20 overflow-hidden animate-fade-in"
            role="listbox"
            aria-label="猫咪列表"
          >
            <div className="max-h-80 overflow-y-auto">
              {cats.length === 0 ? (
                <div className="px-4 py-6 text-center text-gray-500">
                  暂无猫咪档案，点击下方按钮添加
                </div>
              ) : (
                cats.map((cat) => (
                  <div
                    key={cat.id}
                    onClick={() => handleSelectCat(cat.id)}
                    className={cn(
                      'flex items-center gap-3 px-4 py-3 hover:bg-warm-50 cursor-pointer transition-colors group',
                      cat.id === currentCatId && 'bg-primary-50'
                    )}
                    role="option"
                    aria-selected={cat.id === currentCatId}
                    tabIndex={0}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        handleSelectCat(cat.id);
                      }
                    }}
                  >
                    <img
                      src={cat.avatar}
                      alt={cat.name}
                      className="w-10 h-10 rounded-full object-cover"
                      loading="lazy"
                    />
                    <div className="flex-1 text-left">
                      <div className="font-medium text-gray-800 flex items-center gap-2">
                        {cat.name}
                        {cat.id === currentCatId && (
                          <Check className="w-4 h-4 text-primary-500" />
                        )}
                      </div>
                      <div className="text-xs text-gray-500">
                        {cat.breed} · {formatAge(cat.birthday)}
                      </div>
                    </div>
                    {showActions && (
                      <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button
                          onClick={(e) => handleEditCat(cat, e)}
                          className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-primary-500 transition-colors"
                          aria-label={`编辑${cat.name}的信息`}
                          title="编辑"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>
                        {cats.length > 1 && (
                          <button
                            onClick={(e) => handleDeleteCat(cat.id, e)}
                            className="p-2 rounded-lg hover:bg-gray-100 text-gray-400 hover:text-danger-500 transition-colors"
                            aria-label={`删除${cat.name}的档案`}
                            title="删除"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
            {showAddButton && (
              <div className="p-3 border-t border-gray-100">
                <Button
                  variant="secondary"
                  size="sm"
                  className="w-full justify-center gap-2"
                  onClick={handleAddCat}
                  aria-label="添加新猫咪"
                >
                  <Plus className="w-4 h-4" />
                  添加新猫咪
                </Button>
              </div>
            )}
          </div>
        </>
      )}

      <Modal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          resetForm();
        }}
        title={editingCat ? '编辑猫咪信息' : '添加新猫咪'}
        size="md"
      >
        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div className="flex flex-col items-center mb-6">
            <div className="relative group">
              <img
                src={avatarPreview || formData.avatar || generateDefaultAvatar(formData.breed)}
                alt="头像预览"
                className="w-24 h-24 rounded-full object-cover border-4 border-primary-100"
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full opacity-0 group-hover:opacity-100 transition-opacity text-white"
                aria-label="上传头像"
              >
                <Upload className="w-6 h-6" />
              </button>
              {avatarPreview && (
                <button
                  type="button"
                  onClick={handleRemoveAvatar}
                  className="absolute -top-1 -right-1 p-1 bg-danger-500 rounded-full text-white hover:bg-danger-600 transition-colors"
                  aria-label="移除头像"
                >
                  <X className="w-3 h-3" />
                </button>
              )}
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
              aria-label="选择头像图片"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="mt-2 text-sm text-primary-500 hover:text-primary-600"
            >
              点击上传头像
            </button>
            {formErrors.avatar && (
              <p className="mt-1 text-xs text-danger-500">{formErrors.avatar}</p>
            )}
          </div>

          <Input
            label="猫咪名字 *"
            value={formData.name}
            onChange={(e) => handleInputChange('name', e.target.value)}
            placeholder="请输入猫咪名字"
            error={formErrors.name}
            maxLength={20}
            required
            autoFocus
          />
          
          <Select
            label="品种 *"
            value={formData.breed}
            onChange={(e) => handleInputChange('breed', e.target.value)}
            options={BREED_OPTIONS.map(b => ({ value: b, label: b }))}
            error={formErrors.breed}
            required
          />
          
          <div className="grid grid-cols-2 gap-4">
            <Input
              label="出生日期 *"
              type="date"
              value={formData.birthday}
              onChange={(e) => handleInputChange('birthday', e.target.value)}
              error={formErrors.birthday}
              required
            />
            
            <Select
              label="性别 *"
              value={formData.gender}
              onChange={(e) => handleInputChange('gender', e.target.value)}
              options={[
                { value: 'male', label: '公猫' },
                { value: 'female', label: '母猫' },
              ]}
              error={formErrors.gender}
              required
            />
          </div>
          
          <Input
            label="头像链接（可选）"
            value={formData.avatar.startsWith('data:') ? '' : formData.avatar}
            onChange={(e) => handleInputChange('avatar', e.target.value)}
            placeholder="留空将使用默认头像"
            helperText="也可以点击上方上传本地图片"
            disabled={!!avatarPreview}
          />
          
          <div className="flex gap-3 pt-4">
            <Button
              type="button"
              variant="secondary"
              className="flex-1"
              onClick={() => {
                setIsModalOpen(false);
                resetForm();
              }}
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
