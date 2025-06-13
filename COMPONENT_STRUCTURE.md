# Frontend Component Structure

The frontend components have been reorganized into a more logical and maintainable structure:

## 📁 Component Organization

### `/components/layout/`
- **Navbar.jsx** - Main navigation component used across all pages

### `/components/train-search/`
- **SearchForm.jsx** - Form for searching trains with station inputs and date selection
- **StationInput.jsx** - Autocomplete input component for station selection
- **TrainList.jsx** - Container for displaying the list of trains
- **TrainCard.jsx** - Individual train card component with booking functionality
- **ClassInfo.jsx** - Component displaying available classes and fare information
- **TrainSearchContainer.jsx** - Main container combining search form and train list

### `/components/buddy-system/`
- **Suggestions.jsx** - Container for displaying travel buddy suggestions
- **Suggested.jsx** - Individual buddy card component with invite functionality
- **BuddySystemContainer.jsx** - Main container for buddy system functionality

### `/components/common/`
- **ViewSwitcher.jsx** - Mobile view switcher between trains and buddies
- **ContentDivider.jsx** - Visual divider between train and buddy sections

### Root components
- **Hero.jsx** - Main layout component that orchestrates train search and buddy system

## 🔄 Import Structure

Each folder has an `index.js` file for clean imports:

```javascript
// Instead of:
import TrainCard from '../components/train-search/TrainCard';
import StationInput from '../components/train-search/StationInput';

// You can now use:
import { TrainCard, StationInput } from '../components/train-search';
```

## 🎯 Benefits of New Structure

1. **Better Organization** - Related components are grouped together
2. **Easier Maintenance** - Clear separation of concerns
3. **Improved Scalability** - Easy to add new components to appropriate folders
4. **Clean Imports** - Barrel exports make imports more readable
5. **Component Reusability** - Clear boundaries make components more reusable

## 🚀 Component Responsibilities

### Train Search Components
- Handle all train search related functionality
- Station selection, date picking, train display
- Train booking and class selection

### Buddy System Components
- Handle travel buddy discovery and interaction
- Friend invitations and chat functionality
- User profile interactions

### Layout Components
- Shared layout elements like navigation
- Global UI components

### Common Components
- Utility components used across different sections
- Mobile-specific UI elements
- Shared visual elements

## 📱 Responsive Design

The new structure maintains the existing responsive design patterns:
- Mobile view switcher for toggling between trains and buddies
- Desktop side-by-side layout
- Responsive forms and cards
