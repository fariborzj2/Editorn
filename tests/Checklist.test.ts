import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Checklist } from '../src/blocks/Checklist';
import { Editron } from '../src/core/Editron';

// Mock Editron
const mockEditor = {
  blockManager: {
    replaceBlock: vi.fn(),
    addBlock: vi.fn()
  }
} as unknown as Editron;

describe('Checklist Block', () => {
  it('should initialize with default data', () => {
    const checklist = new Checklist('test-id', {}, mockEditor);
    const element = checklist.render();

    expect(element.dataset.id).toBe('test-id');
    const items = element.querySelectorAll('.ce-checklist-item');
    expect(items.length).toBe(1);
  });

  it('should initialize with provided data', () => {
    const data = {
        items: [
            { text: 'Task 1', checked: true },
            { text: 'Task 2', checked: false }
        ]
    };
    const checklist = new Checklist('test-id', data, mockEditor);
    const element = checklist.render();

    const items = element.querySelectorAll('.ce-checklist-item');
    expect(items.length).toBe(2);

    const firstCheckbox = items[0].querySelector('.ce-checklist-checkbox');
    expect(firstCheckbox?.classList.contains('ce-checklist-checked')).toBe(true);

    const secondCheckbox = items[1].querySelector('.ce-checklist-checkbox');
    expect(secondCheckbox?.classList.contains('ce-checklist-checked')).toBe(false);
  });

  it('should toggle checkbox on click', () => {
    const checklist = new Checklist('test-id', {}, mockEditor);
    const element = checklist.render();
    const checkbox = element.querySelector('.ce-checklist-checkbox') as HTMLElement;

    expect(checkbox.classList.contains('ce-checklist-checked')).toBe(false);
    checkbox.click();
    expect(checkbox.classList.contains('ce-checklist-checked')).toBe(true);
  });

  it('should save data correctly', () => {
     const data = {
        items: [
            { text: 'Task 1', checked: true }
        ]
    };
    const checklist = new Checklist('test-id', data, mockEditor);

    const saved = checklist.save();
    expect(saved.type).toBe('checklist');
    expect(saved.content.items[0].text).toBe('Task 1');
    expect(saved.content.items[0].checked).toBe(true);
  });
});
