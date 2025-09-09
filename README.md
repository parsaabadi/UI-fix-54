# OpenM++ UI - Dropdown Banner Fix

This repository contains the enhanced OpenM++ UI with the top banner replaced by a compact dropdown selector.

## Changes Made

- Replaced large banner card with compact dropdown interface
- Added RunWorksetSelector component for run and workset selection
- Reduced vertical space usage by approximately 80%
- Maintained all existing functionality including info dialogs
- Added proper navigation handlers for dropdown selections

## Key Files

- `src/components/RunWorksetSelector.vue` - New dropdown selector component
- `src/pages/ModelPage.vue` - Updated to use new selector
- `src/pages/model-page.js` - Added selection change handlers

## Installation

1. Copy the `src` directory to your OpenM++ UI project
2. Copy configuration files (package.json, quasar.config.js, .eslintrc.js)
3. Run `npm install` and `npm run build`

## Usage

The dropdown selector automatically appears when a model run or workset is selected, providing a compact interface for switching between different runs and scenarios.
