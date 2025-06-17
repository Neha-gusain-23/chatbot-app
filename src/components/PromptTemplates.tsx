"use client";

import React, { useState } from 'react';
import Button from './ui/Button';

interface PromptTemplate {
  id: string;
  title: string;
  prompt: string;
  category: string;
}

interface PromptTemplatesProps {
  onSelectPrompt: (prompt: string) => void;
}

const promptTemplates: PromptTemplate[] = [
  {
    id: '1',
    title: 'General Help',
    prompt: 'Hello! How can you help me today?',
    category: 'general'
  },
  {
    id: '2',
    title: 'Code Help',
    prompt: 'Can you help me write a function to sort an array?',
    category: 'coding'
  },
  {
    id: '3',
    title: 'Writing Assistant',
    prompt: 'Help me write a professional email to my boss',
    category: 'writing'
  },
  {
    id: '4',
    title: 'Math Problem',
    prompt: 'Can you solve this equation: 2x + 5 = 15?',
    category: 'math'
  },
  {
    id: '5',
    title: 'Creative Writing',
    prompt: 'Write a short story about a magical forest',
    category: 'creative'
  },
  {
    id: '6',
    title: 'Language Learning',
    prompt: 'Teach me some basic Spanish phrases',
    category: 'language'
  },
  {
    id: '7',
    title: 'Travel Planning',
    prompt: 'Suggest a 3-day itinerary for visiting Paris',
    category: 'travel'
  },
  {
    id: '8',
    title: 'Health Advice',
    prompt: 'What are some healthy breakfast options?',
    category: 'health'
  }
];

const categories = ['all', 'general', 'coding', 'writing', 'math', 'creative', 'language', 'travel', 'health'];

export default function PromptTemplates({ onSelectPrompt }: PromptTemplatesProps) {
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [isExpanded, setIsExpanded] = useState(false);

  const filteredTemplates = selectedCategory === 'all' 
    ? promptTemplates 
    : promptTemplates.filter(template => template.category === selectedCategory);

  return (
    <div className="space-y-3">
      {/* Category Filter */}
      <div className="flex flex-wrap gap-2">
        {categories.map(category => (
          <Button
            key={category}
            variant={selectedCategory === category ? 'primary' : 'ghost'}
            size="sm"
            onClick={() => setSelectedCategory(category)}
            className="capitalize"
          >
            {category}
          </Button>
        ))}
      </div>

      {/* Templates */}
      <div className="space-y-2">
        {filteredTemplates.slice(0, isExpanded ? undefined : 4).map(template => (
          <Button
            key={template.id}
            variant="ghost"
            size="sm"
            onClick={() => onSelectPrompt(template.prompt)}
            className="w-full justify-start text-left h-auto p-3"
          >
            <div>
              <div className="font-medium text-gray-900 dark:text-white">
                {template.title}
              </div>
              <div className="text-sm text-gray-600 dark:text-gray-400 truncate">
                {template.prompt}
              </div>
            </div>
          </Button>
        ))}
      </div>

      {/* Show More/Less */}
      {filteredTemplates.length > 4 && (
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full"
        >
          {isExpanded ? 'Show Less' : `Show ${filteredTemplates.length - 4} More`}
        </Button>
      )}
    </div>
  );
} 