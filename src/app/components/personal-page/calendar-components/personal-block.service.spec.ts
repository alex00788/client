import { TestBed } from '@angular/core/testing';
import { PersonalBlockService } from './personal-block.service';

describe('PersonalBlockService', () => {
  let service: PersonalBlockService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [PersonalBlockService]
    });
    service = TestBed.inject(PersonalBlockService);
  });

  afterEach(() => {
    // Reset service to initial state after each test
    service.personalData = false;
    service.recordsBlock = false;
    service.settingsRecords = false;
    service.settingsBtn = true;
    service.clientListBlock = false;
    service.changeSettingsRecordsBlock = false;
    service.windowAddingNewOrgIsOpen = false;
    service.windowRenameOrgIsOpen = false;
  });

  describe('Service Creation and Initial State', () => {
    it('should be created', () => {
      expect(service).toBeTruthy();
    });

    it('should have correct initial values for all properties', () => {
      expect(service.personalData).toBe(false);
      expect(service.recordsBlock).toBe(false);
      expect(service.settingsRecords).toBe(false);
      expect(service.settingsBtn).toBe(true);
      expect(service.clientListBlock).toBe(false);
      expect(service.changeSettingsRecordsBlock).toBe(false);
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
      expect(service.windowRenameOrgIsOpen).toBe(false);
    });

    it('should be injectable as singleton', () => {
      const service1 = TestBed.inject(PersonalBlockService);
      const service2 = TestBed.inject(PersonalBlockService);
      expect(service1).toBe(service2);
    });
  });

  describe('switchData()', () => {
    it('should toggle personalData from false to true', () => {
      service.personalData = false;
      service.switchData();
      expect(service.personalData).toBe(true);
    });

    it('should toggle personalData from true to false', () => {
      service.personalData = true;
      service.switchData();
      expect(service.personalData).toBe(false);
    });

    it('should call switchSettingsData when settingsRecords is true', () => {
      spyOn(service, 'switchSettingsData');
      service.settingsRecords = true;
      service.switchData();
      expect(service.switchSettingsData).toHaveBeenCalled();
    });

    it('should not call switchSettingsData when settingsRecords is false', () => {
      spyOn(service, 'switchSettingsData');
      service.settingsRecords = false;
      service.switchData();
      expect(service.switchSettingsData).not.toHaveBeenCalled();
    });

    it('should toggle personalData and call switchSettingsData when settingsRecords is true', () => {
      service.personalData = false;
      service.settingsRecords = true;
      spyOn(service, 'switchSettingsData');
      
      service.switchData();
      
      expect(service.personalData).toBe(true);
      expect(service.switchSettingsData).toHaveBeenCalled();
    });
  });

  describe('switchSettingsData()', () => {
    it('should set windowAddingNewOrgIsOpen to false', () => {
      service.windowAddingNewOrgIsOpen = true;
      service.switchSettingsData();
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
    });

    it('should set settingsBtn to false', () => {
      service.settingsBtn = true;
      service.switchSettingsData();
      expect(service.settingsBtn).toBe(false);
    });

    it('should set settingsRecords to true', () => {
      service.settingsRecords = false;
      service.switchSettingsData();
      expect(service.settingsRecords).toBe(true);
    });

    it('should set all three properties correctly in one call', () => {
      service.windowAddingNewOrgIsOpen = true;
      service.settingsBtn = true;
      service.settingsRecords = false;
      
      service.switchSettingsData();
      
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
      expect(service.settingsBtn).toBe(false);
      expect(service.settingsRecords).toBe(true);
    });
  });

  describe('addNewOrgSettings()', () => {
    it('should set windowAddingNewOrgIsOpen to true', () => {
      service.windowAddingNewOrgIsOpen = false;
      service.addNewOrgSettings();
      expect(service.windowAddingNewOrgIsOpen).toBe(true);
    });

    it('should not affect other properties', () => {
      const initialState = {
        personalData: service.personalData,
        recordsBlock: service.recordsBlock,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        clientListBlock: service.clientListBlock,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowRenameOrgIsOpen: service.windowRenameOrgIsOpen
      };
      
      service.addNewOrgSettings();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.recordsBlock).toBe(initialState.recordsBlock);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.clientListBlock).toBe(initialState.clientListBlock);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowRenameOrgIsOpen).toBe(initialState.windowRenameOrgIsOpen);
    });
  });

  describe('renameCurrentOrg()', () => {
    it('should set windowRenameOrgIsOpen to true', () => {
      service.windowRenameOrgIsOpen = false;
      service.renameCurrentOrg();
      expect(service.windowRenameOrgIsOpen).toBe(true);
    });

    it('should not affect other properties', () => {
      const initialState = {
        personalData: service.personalData,
        recordsBlock: service.recordsBlock,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        clientListBlock: service.clientListBlock,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowAddingNewOrgIsOpen: service.windowAddingNewOrgIsOpen
      };
      
      service.renameCurrentOrg();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.recordsBlock).toBe(initialState.recordsBlock);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.clientListBlock).toBe(initialState.clientListBlock);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowAddingNewOrgIsOpen).toBe(initialState.windowAddingNewOrgIsOpen);
    });
  });

  describe('closeWindowRenameOrg()', () => {
    it('should set windowRenameOrgIsOpen to false', () => {
      service.windowRenameOrgIsOpen = true;
      service.closeWindowRenameOrg();
      expect(service.windowRenameOrgIsOpen).toBe(false);
    });

    it('should not affect other properties', () => {
      service.windowRenameOrgIsOpen = true;
      const initialState = {
        personalData: service.personalData,
        recordsBlock: service.recordsBlock,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        clientListBlock: service.clientListBlock,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowAddingNewOrgIsOpen: service.windowAddingNewOrgIsOpen
      };
      
      service.closeWindowRenameOrg();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.recordsBlock).toBe(initialState.recordsBlock);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.clientListBlock).toBe(initialState.clientListBlock);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowAddingNewOrgIsOpen).toBe(initialState.windowAddingNewOrgIsOpen);
    });
  });

  describe('changeSettingsRecords()', () => {
    it('should toggle settingsRecords from false to true', () => {
      service.settingsRecords = false;
      service.changeSettingsRecords();
      expect(service.settingsRecords).toBe(true);
    });

    it('should toggle settingsRecords from true to false', () => {
      service.settingsRecords = true;
      service.changeSettingsRecords();
      expect(service.settingsRecords).toBe(false);
    });

    it('should set changeSettingsRecordsBlock to true', () => {
      service.changeSettingsRecordsBlock = false;
      service.changeSettingsRecords();
      expect(service.changeSettingsRecordsBlock).toBe(true);
    });

    it('should toggle settingsRecords and set changeSettingsRecordsBlock in one call', () => {
      service.settingsRecords = false;
      service.changeSettingsRecordsBlock = false;
      
      service.changeSettingsRecords();
      
      expect(service.settingsRecords).toBe(true);
      expect(service.changeSettingsRecordsBlock).toBe(true);
    });

    it('should always set changeSettingsRecordsBlock to true regardless of settingsRecords initial value', () => {
      // Test when settingsRecords starts as false
      service.settingsRecords = false;
      service.changeSettingsRecordsBlock = false;
      service.changeSettingsRecords();
      expect(service.changeSettingsRecordsBlock).toBe(true);

      // Reset and test when settingsRecords starts as true
      service.settingsRecords = true;
      service.changeSettingsRecordsBlock = false;
      service.changeSettingsRecords();
      expect(service.changeSettingsRecordsBlock).toBe(true);
    });
  });

  describe('openRecordsBlock()', () => {
    it('should set recordsBlock to true', () => {
      service.recordsBlock = false;
      service.openRecordsBlock();
      expect(service.recordsBlock).toBe(true);
    });

    it('should not affect other properties', () => {
      const initialState = {
        personalData: service.personalData,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        clientListBlock: service.clientListBlock,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowAddingNewOrgIsOpen: service.windowAddingNewOrgIsOpen,
        windowRenameOrgIsOpen: service.windowRenameOrgIsOpen
      };
      
      service.openRecordsBlock();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.clientListBlock).toBe(initialState.clientListBlock);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowAddingNewOrgIsOpen).toBe(initialState.windowAddingNewOrgIsOpen);
      expect(service.windowRenameOrgIsOpen).toBe(initialState.windowRenameOrgIsOpen);
    });
  });

  describe('closeRecordsBlock()', () => {
    it('should set recordsBlock to false', () => {
      service.recordsBlock = true;
      service.closeRecordsBlock();
      expect(service.recordsBlock).toBe(false);
    });

    it('should not affect other properties', () => {
      service.recordsBlock = true;
      const initialState = {
        personalData: service.personalData,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        clientListBlock: service.clientListBlock,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowAddingNewOrgIsOpen: service.windowAddingNewOrgIsOpen,
        windowRenameOrgIsOpen: service.windowRenameOrgIsOpen
      };
      
      service.closeRecordsBlock();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.clientListBlock).toBe(initialState.clientListBlock);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowAddingNewOrgIsOpen).toBe(initialState.windowAddingNewOrgIsOpen);
      expect(service.windowRenameOrgIsOpen).toBe(initialState.windowRenameOrgIsOpen);
    });
  });

  describe('closeWindowAddedNewOrg()', () => {
    it('should set windowAddingNewOrgIsOpen to false', () => {
      service.windowAddingNewOrgIsOpen = true;
      service.closeWindowAddedNewOrg();
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
    });

    it('should not affect other properties', () => {
      service.windowAddingNewOrgIsOpen = true;
      const initialState = {
        personalData: service.personalData,
        recordsBlock: service.recordsBlock,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        clientListBlock: service.clientListBlock,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowRenameOrgIsOpen: service.windowRenameOrgIsOpen
      };
      
      service.closeWindowAddedNewOrg();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.recordsBlock).toBe(initialState.recordsBlock);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.clientListBlock).toBe(initialState.clientListBlock);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowRenameOrgIsOpen).toBe(initialState.windowRenameOrgIsOpen);
    });
  });

  describe('closeSettings()', () => {
    it('should set settingsBtn to true', () => {
      service.settingsBtn = false;
      service.closeSettings();
      expect(service.settingsBtn).toBe(true);
    });

    it('should set changeSettingsRecordsBlock to false', () => {
      service.changeSettingsRecordsBlock = true;
      service.closeSettings();
      expect(service.changeSettingsRecordsBlock).toBe(false);
    });

    it('should set settingsRecords to false', () => {
      service.settingsRecords = true;
      service.closeSettings();
      expect(service.settingsRecords).toBe(false);
    });

    it('should set all three properties correctly in one call', () => {
      service.settingsBtn = false;
      service.changeSettingsRecordsBlock = true;
      service.settingsRecords = true;
      
      service.closeSettings();
      
      expect(service.settingsBtn).toBe(true);
      expect(service.changeSettingsRecordsBlock).toBe(false);
      expect(service.settingsRecords).toBe(false);
    });

    it('should not affect other properties', () => {
      const initialState = {
        personalData: service.personalData,
        recordsBlock: service.recordsBlock,
        clientListBlock: service.clientListBlock,
        windowAddingNewOrgIsOpen: service.windowAddingNewOrgIsOpen,
        windowRenameOrgIsOpen: service.windowRenameOrgIsOpen
      };
      
      service.closeSettings();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.recordsBlock).toBe(initialState.recordsBlock);
      expect(service.clientListBlock).toBe(initialState.clientListBlock);
      expect(service.windowAddingNewOrgIsOpen).toBe(initialState.windowAddingNewOrgIsOpen);
      expect(service.windowRenameOrgIsOpen).toBe(initialState.windowRenameOrgIsOpen);
    });
  });

  describe('openClientList()', () => {
    it('should set clientListBlock to true', () => {
      service.clientListBlock = false;
      service.openClientList();
      expect(service.clientListBlock).toBe(true);
    });

    it('should not affect other properties', () => {
      const initialState = {
        personalData: service.personalData,
        recordsBlock: service.recordsBlock,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowAddingNewOrgIsOpen: service.windowAddingNewOrgIsOpen,
        windowRenameOrgIsOpen: service.windowRenameOrgIsOpen
      };
      
      service.openClientList();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.recordsBlock).toBe(initialState.recordsBlock);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowAddingNewOrgIsOpen).toBe(initialState.windowAddingNewOrgIsOpen);
      expect(service.windowRenameOrgIsOpen).toBe(initialState.windowRenameOrgIsOpen);
    });
  });

  describe('closeClientList()', () => {
    it('should set clientListBlock to false', () => {
      service.clientListBlock = true;
      service.closeClientList();
      expect(service.clientListBlock).toBe(false);
    });

    it('should not affect other properties', () => {
      service.clientListBlock = true;
      const initialState = {
        personalData: service.personalData,
        recordsBlock: service.recordsBlock,
        settingsRecords: service.settingsRecords,
        settingsBtn: service.settingsBtn,
        changeSettingsRecordsBlock: service.changeSettingsRecordsBlock,
        windowAddingNewOrgIsOpen: service.windowAddingNewOrgIsOpen,
        windowRenameOrgIsOpen: service.windowRenameOrgIsOpen
      };
      
      service.closeClientList();
      
      expect(service.personalData).toBe(initialState.personalData);
      expect(service.recordsBlock).toBe(initialState.recordsBlock);
      expect(service.settingsRecords).toBe(initialState.settingsRecords);
      expect(service.settingsBtn).toBe(initialState.settingsBtn);
      expect(service.changeSettingsRecordsBlock).toBe(initialState.changeSettingsRecordsBlock);
      expect(service.windowAddingNewOrgIsOpen).toBe(initialState.windowAddingNewOrgIsOpen);
      expect(service.windowRenameOrgIsOpen).toBe(initialState.windowRenameOrgIsOpen);
    });
  });

  describe('Complex State Interactions', () => {
    it('should handle multiple operations correctly', () => {
      // Start with initial state
      expect(service.personalData).toBe(false);
      expect(service.settingsRecords).toBe(false);
      
      // Open personal data
      service.switchData();
      expect(service.personalData).toBe(true);
      
      // Enable settings
      service.changeSettingsRecords();
      expect(service.settingsRecords).toBe(true);
      expect(service.changeSettingsRecordsBlock).toBe(true);
      
      // Switch data again (should call switchSettingsData because settingsRecords is true)
      service.switchData();
      expect(service.personalData).toBe(false);
      expect(service.settingsBtn).toBe(false);
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
      
      // Close all settings
      service.closeSettings();
      expect(service.settingsBtn).toBe(true);
      expect(service.changeSettingsRecordsBlock).toBe(false);
      expect(service.settingsRecords).toBe(false);
    });

    it('should handle window operations correctly', () => {
      // Open add new org window
      service.addNewOrgSettings();
      expect(service.windowAddingNewOrgIsOpen).toBe(true);
      
      // Open rename org window
      service.renameCurrentOrg();
      expect(service.windowRenameOrgIsOpen).toBe(true);
      expect(service.windowAddingNewOrgIsOpen).toBe(true); // Should not be affected
      
      // Close rename window
      service.closeWindowRenameOrg();
      expect(service.windowRenameOrgIsOpen).toBe(false);
      expect(service.windowAddingNewOrgIsOpen).toBe(true); // Should not be affected
      
      // Close add new org window
      service.closeWindowAddedNewOrg();
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
    });

    it('should handle block operations correctly', () => {
      // Open records block
      service.openRecordsBlock();
      expect(service.recordsBlock).toBe(true);
      
      // Open client list
      service.openClientList();
      expect(service.clientListBlock).toBe(true);
      expect(service.recordsBlock).toBe(true); // Should not be affected
      
      // Close records block
      service.closeRecordsBlock();
      expect(service.recordsBlock).toBe(false);
      expect(service.clientListBlock).toBe(true); // Should not be affected
      
      // Close client list
      service.closeClientList();
      expect(service.clientListBlock).toBe(false);
    });
  });

  describe('Edge Cases and Error Scenarios', () => {
    it('should handle multiple calls to the same method', () => {
      // Multiple calls to addNewOrgSettings
      service.addNewOrgSettings();
      service.addNewOrgSettings();
      service.addNewOrgSettings();
      expect(service.windowAddingNewOrgIsOpen).toBe(true);
      
      // Multiple calls to closeWindowAddedNewOrg
      service.closeWindowAddedNewOrg();
      service.closeWindowAddedNewOrg();
      service.closeWindowAddedNewOrg();
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
    });

    it('should handle toggle methods being called multiple times', () => {
      // Test switchData multiple times
      expect(service.personalData).toBe(false);
      service.switchData(); // true
      service.switchData(); // false
      service.switchData(); // true
      service.switchData(); // false
      expect(service.personalData).toBe(false);
      
      // Test changeSettingsRecords multiple times
      expect(service.settingsRecords).toBe(false);
      service.changeSettingsRecords(); // true
      service.changeSettingsRecords(); // false
      service.changeSettingsRecords(); // true
      expect(service.settingsRecords).toBe(true);
      expect(service.changeSettingsRecordsBlock).toBe(true); // Always true after call
    });

    it('should maintain state consistency when calling methods in random order', () => {
      // Random sequence of operations
      service.openClientList();
      service.switchData();
      service.renameCurrentOrg();
      service.changeSettingsRecords();
      service.openRecordsBlock();
      service.addNewOrgSettings();
      
      // Verify all states
      expect(service.clientListBlock).toBe(true);
      expect(service.personalData).toBe(true);
      expect(service.windowRenameOrgIsOpen).toBe(true);
      expect(service.settingsRecords).toBe(true);
      expect(service.changeSettingsRecordsBlock).toBe(true);
      expect(service.recordsBlock).toBe(true);
      expect(service.windowAddingNewOrgIsOpen).toBe(true);
      
      // Close everything
      service.closeClientList();
      service.closeRecordsBlock();
      service.closeWindowRenameOrg();
      service.closeWindowAddedNewOrg();
      service.closeSettings();
      
      // Should be mostly back to initial state except personalData
      expect(service.clientListBlock).toBe(false);
      expect(service.recordsBlock).toBe(false);
      expect(service.windowRenameOrgIsOpen).toBe(false);
      expect(service.windowAddingNewOrgIsOpen).toBe(false);
      expect(service.settingsRecords).toBe(false);
      expect(service.changeSettingsRecordsBlock).toBe(false);
      expect(service.settingsBtn).toBe(true);
      expect(service.personalData).toBe(true); // Not affected by closeSettings
    });
  });

  describe('Property Type and Value Validation', () => {
    it('should maintain boolean types for all properties', () => {
      expect(typeof service.personalData).toBe('boolean');
      expect(typeof service.recordsBlock).toBe('boolean');
      expect(typeof service.settingsRecords).toBe('boolean');
      expect(typeof service.settingsBtn).toBe('boolean');
      expect(typeof service.clientListBlock).toBe('boolean');
      expect(typeof service.changeSettingsRecordsBlock).toBe('boolean');
      expect(typeof service.windowAddingNewOrgIsOpen).toBe('boolean');
      expect(typeof service.windowRenameOrgIsOpen).toBe('boolean');
    });

    it('should maintain strict boolean values', () => {
      // Test that properties are strictly boolean
      service.personalData = true;
      expect(service.personalData).toBe(true);
      expect(service.personalData).toEqual(true);
      
      service.personalData = false;
      expect(service.personalData).toBe(false);
      expect(service.personalData).toEqual(false);
      
      // Test all boolean properties
      service.recordsBlock = true;
      expect(service.recordsBlock).toBe(true);
      service.settingsRecords = false;
      expect(service.settingsRecords).toBe(false);
    });
  });

  describe('Method Return Values', () => {
    it('should verify that all methods return undefined (void)', () => {
      expect(service.switchData()).toBeUndefined();
      expect(service.switchSettingsData()).toBeUndefined();
      expect(service.addNewOrgSettings()).toBeUndefined();
      expect(service.renameCurrentOrg()).toBeUndefined();
      expect(service.closeWindowRenameOrg()).toBeUndefined();
      expect(service.changeSettingsRecords()).toBeUndefined();
      expect(service.openRecordsBlock()).toBeUndefined();
      expect(service.closeRecordsBlock()).toBeUndefined();
      expect(service.closeWindowAddedNewOrg()).toBeUndefined();
      expect(service.closeSettings()).toBeUndefined();
      expect(service.openClientList()).toBeUndefined();
      expect(service.closeClientList()).toBeUndefined();
    });
  });
});
