'use client';

import { useState } from 'react';
import Image from 'next/image';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Crown, Check, Lock } from 'lucide-react';
import { SIMPLE_TEMPLATES, SimpleTemplate } from '@/lib/cv/simple-templates';

interface SimpleTemplateGalleryProps {
  selectedTemplate?: string | null;
  onTemplateSelect: (templateId: string) => void;
  className?: string;
  isPremium?: boolean;
  onUpgradeClick?: () => void;
}

const CATEGORY_LABELS = {
  modern: 'Modern',
  traditional: 'Traditionell',
  creative: 'Kreativ'
};

export default function SimpleTemplateGallery({
  selectedTemplate,
  onTemplateSelect,
  className = "",
  isPremium = false,
  onUpgradeClick
}: SimpleTemplateGalleryProps) {
  const [selectedCategory, setSelectedCategory] = useState<SimpleTemplate['category'] | 'all'>('all');

  const filteredTemplates = selectedCategory === 'all' 
    ? SIMPLE_TEMPLATES 
    : SIMPLE_TEMPLATES.filter(template => template.category === selectedCategory);

  const getCategoryColor = (category: SimpleTemplate['category']) => {
    switch (category) {
      case 'modern':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'traditional':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'creative':
        return 'bg-purple-100 text-purple-800 border-purple-200';
    }
  };

  return (
    <div className={`simple-template-gallery ${className}`}>
      {/* Category Filter */}
      <div className="flex items-center space-x-2 mb-6">
        <Button
          variant={selectedCategory === 'all' ? 'default' : 'outline'}
          size="sm"
          onClick={() => setSelectedCategory('all')}
          className={`text-sm ${
            selectedCategory === 'all' 
              ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-0' 
              : 'bg-navy-900/60 border-navy-600 text-gray-300 hover:bg-navy-700/50 hover:text-white'
          }`}
        >
          Alla mallar
        </Button>
        {Object.entries(CATEGORY_LABELS).map(([category, label]) => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'default' : 'outline'}
            size="sm"
            onClick={() => setSelectedCategory(category as SimpleTemplate['category'])}
            className={`text-sm ${
              selectedCategory === category 
                ? 'bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white border-0' 
                : 'bg-navy-900/60 border-navy-600 text-gray-300 hover:bg-navy-700/50 hover:text-white'
            }`}
          >
            {label}
          </Button>
        ))}
      </div>

      {/* Template Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => {
          const isSelected = selectedTemplate === template.id;
          const isPremiumTemplate = template.tier === 'premium';
          const isLocked = isPremiumTemplate && !isPremium;

          const handleClick = () => {
            if (isLocked && onUpgradeClick) {
              onUpgradeClick();
            } else if (!isLocked) {
              onTemplateSelect(template.id);
            }
          };

          return (
            <Card
              key={template.id}
              className={`cursor-pointer transition-all duration-200 hover:shadow-md border relative ${
                isSelected
                  ? 'ring-2 ring-pink-500 shadow-lg bg-navy-700 border-pink-500'
                  : isLocked
                  ? 'bg-navy-900/40 border-navy-600 opacity-75 hover:opacity-90'
                  : 'hover:shadow-lg hover:scale-[1.02] bg-navy-900/60 border-navy-600 hover:border-navy-500'
              }`}
              onClick={handleClick}
            >
              {/* Lock overlay for premium templates */}
              {isLocked && (
                <div className="absolute inset-0 bg-navy-900/80 backdrop-blur-sm rounded-lg flex items-center justify-center z-10">
                  <div className="text-center">
                    <Lock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-gray-300 font-medium mb-2">Premium Mall</p>
                    <Button
                      size="sm"
                      className="bg-gradient-to-r from-pink-600 to-purple-600 hover:from-pink-700 hover:to-purple-700 text-white text-xs"
                      onClick={(e) => {
                        e.stopPropagation();
                        onUpgradeClick?.();
                      }}
                    >
                      <Crown className="h-3 w-3 mr-1" />
                      Uppgradera
                    </Button>
                  </div>
                </div>
              )}

              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className={`text-lg font-semibold flex items-center gap-2 ${
                    isLocked ? 'text-gray-400' : 'text-white'
                  }`}>
                    {isPremiumTemplate && <Crown className="h-4 w-4 text-amber-500" />}
                    {template.name}
                  </CardTitle>
                  {isSelected && !isLocked && (
                    <Check className="h-5 w-5 text-pink-400" />
                  )}
                </div>
                <CardDescription className={`text-sm ${
                  isLocked ? 'text-gray-500' : 'text-gray-300'
                }`}>
                  {template.description}
                </CardDescription>
              </CardHeader>

              <CardContent className="space-y-4">
                {/* Template Preview Image */}
                <div className="relative aspect-[3/4] bg-gray-100 rounded-lg overflow-hidden">
                  <Image
                    src={template.imagePath}
                    alt={`${template.name} CV-mall`}
                    fill
                    className="object-contain p-2"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                </div>

                {/* Template Badges */}
                <div className="flex items-center justify-between">
                  <div className="flex gap-2">
                    <Badge
                      variant="outline"
                      className={`text-xs border-navy-500 ${getCategoryColor(template.category)} ${
                        isLocked ? 'opacity-60' : ''
                      }`}
                    >
                      {CATEGORY_LABELS[template.category]}
                    </Badge>
                    {isPremiumTemplate ? (
                      <Badge className={`text-xs ${
                        isLocked
                          ? 'bg-gray-600 text-gray-400 border-gray-600'
                          : 'bg-amber-100 text-amber-800 border-amber-200'
                      }`}>
                        <Crown className="h-3 w-3 mr-1" />
                        {isLocked ? 'Låst' : 'Premium'}
                      </Badge>
                    ) : (
                      <Badge variant="outline" className="bg-green-900/30 text-green-400 border-green-600 text-xs">
                        Gratis
                      </Badge>
                    )}
                  </div>

                  {isSelected && !isLocked && (
                    <Badge className="bg-pink-500 text-white text-xs">
                      Vald
                    </Badge>
                  )}
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-8 text-gray-400">
          <p>Inga mallar hittades i denna kategori.</p>
        </div>
      )}
    </div>
  );
}