import { useState, useRef, useCallback } from 'react';
import { sidebarConfigRef } from '../firebase';

// Helper function to reorder items in an array
const reorder = (list, startIndex, endIndex) => {
  const result = Array.from(list);
  const [removed] = result.splice(startIndex, 1);
  result.splice(endIndex, 0, removed);
  return result;
};

const defaultMenuItem = {
  name: '',
  path: '',
  icon: 'collections',
  type: 'collection',
  collection: ''
};

export const useMenuManagement = () => {
  const [sidebarItems, setSidebarItems] = useState([]);
  const [newMenuItem, setNewMenuItem] = useState(defaultMenuItem);
  const [editingItem, setEditingItem] = useState(null);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const dragItemIndex = useRef(null);

  const loadNavItems = useCallback(async () => {
    setLoading(true);
    try {
      const doc = await sidebarConfigRef.doc('main').get();
      if (doc.exists) {
        const items = doc.data().items || [];
        const sortedItems = items.sort((a, b) => (a.order || 0) - (b.order || 0));
        setSidebarItems(sortedItems);
      }
      setError(null);
    } catch (error) {
      console.error('Error loading navigation items:', error);
      setError('Failed to load menu items. Please try again.');
    } finally {
      setLoading(false);
    }
  }, []);

  const handleAddMenuItem = useCallback(async () => {
    if (!newMenuItem.name || !newMenuItem.path) return;

    try {
      const newItem = {
        ...newMenuItem,
        id: Date.now().toString(),
        order: sidebarItems.length,
      };

      const updatedItems = [...sidebarItems, newItem];
      await sidebarConfigRef.doc('main').set({
        items: updatedItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
      setSidebarItems(updatedItems);
      setNewMenuItem(defaultMenuItem);
    } catch (error) {
      console.error('Error adding menu item:', error);
      setError('Failed to add menu item. Please try again.');
    }
  }, [newMenuItem, sidebarItems]);

  const handleEditSave = useCallback(async () => {
    if (!editingItem?.name || !editingItem?.path) return;

    try {
      const updatedItems = sidebarItems.map(item =>
        item.id === editingItem.id ? editingItem : item
      );
      
      await sidebarConfigRef.doc('main').set({
        items: updatedItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
      
      setSidebarItems(updatedItems);
      setIsEditDialogOpen(false);
      setEditingItem(null);
    } catch (error) {
      console.error('Error updating menu item:', error);
      setError('Failed to update menu item. Please try again.');
    }
  }, [editingItem, sidebarItems]);

  const handleDeleteItem = useCallback(async (itemId) => {
    try {
      const updatedItems = sidebarItems.filter(item => item.id !== itemId);
      await sidebarConfigRef.doc('main').set({
        items: updatedItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
      setSidebarItems(updatedItems);
    } catch (error) {
      console.error('Error deleting menu item:', error);
      setError('Failed to delete menu item. Please try again.');
    }
  }, [sidebarItems]);

  const handleDragStart = useCallback((e, index) => {
    dragItemIndex.current = index;
    e.dataTransfer.effectAllowed = "move";
  }, []);

  const handleDragOver = useCallback((e) => {
    e.preventDefault();
  }, []);

  const handleDrop = useCallback(async (e, dropIndex) => {
    e.preventDefault();
    const dragIndex = dragItemIndex.current;
    if (dragIndex === null || dragIndex === dropIndex) {
      return;
    }
    const newItems = reorder(sidebarItems, dragIndex, dropIndex);
    setSidebarItems(newItems);
    dragItemIndex.current = null;
    try {
      await sidebarConfigRef.doc('main').set({
        items: newItems.map((item, index) => ({
          ...item,
          order: index,
        })),
      });
    } catch (error) {
      console.error('Error reordering items:', error);
      setError('Failed to reorder items. Please try again.');
    }
  }, [sidebarItems]);

  return {
    sidebarItems,
    newMenuItem,
    editingItem,
    isEditDialogOpen,
    loading,
    error,
    setNewMenuItem,
    setEditingItem,
    setIsEditDialogOpen,
    loadNavItems,
    handleAddMenuItem,
    handleEditSave,
    handleDeleteItem,
    handleDragStart,
    handleDragOver,
    handleDrop,
    defaultMenuItem
  };
};