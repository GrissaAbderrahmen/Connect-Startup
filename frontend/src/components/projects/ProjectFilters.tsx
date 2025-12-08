// components/projects/ProjectFilters.tsx
import { useState } from 'react';
import { ProjectFilters as FilterType } from '@/types';
import { Input } from '@/components/common/Input';
import { Select } from '@/components/common/Select';
import { Button } from '@/components/common/Button';
import { PROJECT_CATEGORIES } from '@/utils/constants';

interface ProjectFiltersProps {
  onFilter: (filters: FilterType) => void;
}

export const ProjectFilters = ({ onFilter }: ProjectFiltersProps) => {
  const [filters, setFilters] = useState<FilterType>({
    category: '',
    min_budget: undefined,
    max_budget: undefined,
    skills: '',
    query: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Remove empty values and convert skills to lowercase for backend compatibility
    const cleanFilters = Object.entries(filters).reduce((acc, [key, value]) => {
      if (value !== '' && value !== undefined) {
        // Convert skills to lowercase to match backend comparison
        if (key === 'skills' && typeof value === 'string') {
          (acc as any)[key] = value.toLowerCase();
        } else {
          (acc as any)[key] = value;
        }
      }
      return acc;
    }, {} as FilterType);
    
    onFilter(cleanFilters);
  };

  const handleReset = () => {
    setFilters({
      category: '',
      min_budget: undefined,
      max_budget: undefined,
      skills: '',
      query: '',
    });
    onFilter({});
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-md p-6 space-y-4">
      <h3 className="text-lg font-semibold text-neutral-900 mb-4">Filter Projects</h3>

      <Input
        label="Search"
        type="text"
        placeholder="Search projects..."
        value={filters.query}
        onChange={(e) => setFilters({ ...filters, query: e.target.value })}
      />

      <Select
        label="Category"
        options={[
          { value: '', label: 'All Categories' },
          ...PROJECT_CATEGORIES.map((cat) => ({ value: cat, label: cat })),
        ]}
        value={filters.category}
        onChange={(e) => setFilters({ ...filters, category: e.target.value })}
      />

      <div className="grid grid-cols-2 gap-4">
        <Input
          label="Min Budget"
          type="number"
          placeholder="$0"
          value={filters.min_budget || ''}
          onChange={(e) =>
            setFilters({ ...filters, min_budget: e.target.value ? Number(e.target.value) : undefined })
          }
        />
        <Input
          label="Max Budget"
          type="number"
          placeholder="$10,000"
          value={filters.max_budget || ''}
          onChange={(e) =>
            setFilters({ ...filters, max_budget: e.target.value ? Number(e.target.value) : undefined })
          }
        />
      </div>

      <Input
        label="Skills"
        type="text"
        placeholder="React, Node.js, Python"
        value={filters.skills}
        onChange={(e) => setFilters({ ...filters, skills: e.target.value })}
      />

      <div className="flex gap-3 pt-2">
        <Button type="submit" className="flex-1">
          Apply Filters
        </Button>
        <Button type="button" variant="outline" onClick={handleReset}>
          Reset
        </Button>
      </div>
    </form>
  );
};