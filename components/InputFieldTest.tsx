import React, { useState } from 'react';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Textarea } from './ui/Textarea';
import { AutocompleteInput } from './ui/AutocompleteInput';
import { Card } from './ui/Card';

export const InputFieldTest: React.FC = () => {
  const [formData, setFormData] = useState({
    textInput: '',
    numberInput: '',
    emailInput: '',
    passwordInput: '',
    dateInput: '',
    selectInput: '',
    textareaInput: '',
    autocompleteInput: ''
  });

  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const autocompleteOptions = ['Option 1', 'Option 2', 'Option 3', 'Test Option', 'Another Option'];

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      <Card title="Input Field Visibility Test">
        <div className="space-y-6">
          <p className="text-gray-600">
            This test page verifies that all input field types are visible and properly styled across different screen sizes.
          </p>
          
          {/* Text Input */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Text Input Fields</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <Input
                label="Text Input"
                name="textInput"
                value={formData.textInput}
                onChange={handleChange}
                placeholder="Enter some text"
                error={errors.textInput}
              />
              <Input
                label="Number Input"
                name="numberInput"
                type="number"
                value={formData.numberInput}
                onChange={handleChange}
                placeholder="Enter a number"
                error={errors.numberInput}
              />
              <Input
                label="Email Input"
                name="emailInput"
                type="email"
                value={formData.emailInput}
                onChange={handleChange}
                placeholder="Enter email address"
                error={errors.emailInput}
              />
              <Input
                label="Password Input"
                name="passwordInput"
                type="password"
                value={formData.passwordInput}
                onChange={handleChange}
                placeholder="Enter password"
                error={errors.passwordInput}
              />
              <Input
                label="Date Input"
                name="dateInput"
                type="date"
                value={formData.dateInput}
                onChange={handleChange}
                error={errors.dateInput}
              />
            </div>
          </div>

          {/* Select Input */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Select Input</h3>
            <Select
              label="Truck Type"
              name="selectInput"
              value={formData.selectInput}
              onChange={handleChange}
              error={errors.selectInput}
            >
              <option value="">Select a truck type</option>
              <option value="open">Open Truck</option>
              <option value="closed">Closed Truck</option>
              <option value="container">Container</option>
              <option value="trailer">Trailer</option>
            </Select>
          </div>

          {/* Textarea Input */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Textarea Input</h3>
            <Textarea
              label="Description"
              name="textareaInput"
              value={formData.textareaInput}
              onChange={handleChange}
              placeholder="Enter a detailed description"
              rows={4}
              error={errors.textareaInput}
            />
          </div>

          {/* Autocomplete Input */}
          <div>
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Autocomplete Input</h3>
            <AutocompleteInput
              label="Search Options"
              name="autocompleteInput"
              value={formData.autocompleteInput}
              onChange={handleChange}
              options={autocompleteOptions}
              placeholder="Type to search options"
              error={errors.autocompleteInput}
            />
          </div>

          {/* Test Results */}
          <div className="mt-8 p-4 bg-gray-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-4 text-gray-800">Form Data (for testing)</h3>
            <pre className="text-sm text-gray-600 bg-white p-3 rounded border overflow-auto">
              {JSON.stringify(formData, null, 2)}
            </pre>
          </div>

          {/* Instructions */}
          <div className="mt-8 p-4 bg-blue-50 rounded-lg">
            <h3 className="text-lg font-semibold mb-2 text-blue-800">Testing Instructions</h3>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• All input fields should have white backgrounds with dark text</li>
              <li>• Labels should be clearly visible and properly positioned</li>
              <li>• Focus states should show clear blue outlines</li>
              <li>• Placeholder text should be visible in light gray</li>
              <li>• All fields should be clickable and editable</li>
              <li>• Test on different screen sizes (mobile, tablet, desktop)</li>
              <li>• Test with different browsers (Chrome, Firefox, Safari, Edge)</li>
            </ul>
          </div>
        </div>
      </Card>
    </div>
  );
};
