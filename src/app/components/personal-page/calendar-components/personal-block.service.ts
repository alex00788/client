import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class PersonalBlockService {

  constructor() { }
  personalData: boolean = false;
  recordsBlock: boolean = false;
  settingsRecords: boolean = false;
  settingsBtn: boolean = true;
  clientListBlock: boolean = false;
  changeSettingsRecordsBlock: boolean = false;
  windowAddingNewOrgIsOpen: boolean = false;
  windowRenameOrgIsOpen: boolean = false;


  switchData() {
    this.personalData = !this.personalData;
    if (this.settingsRecords) {
      this.switchSettingsData();
    }
  }

  switchSettingsData() {
    this.windowAddingNewOrgIsOpen = false;
    this.settingsBtn = false;
    this.settingsRecords = true;
  }

  addNewOrgSettings () {
    this.windowAddingNewOrgIsOpen = true;
  }

  renameCurrentOrg () {
    this.windowRenameOrgIsOpen = true;
  }

  closeWindowRenameOrg() {
    this.windowRenameOrgIsOpen = false;
  }

  changeSettingsRecords() {
    this.settingsRecords = !this.settingsRecords;
    this.changeSettingsRecordsBlock = true;
  }

  openRecordsBlock() {
    this.recordsBlock = true;
  }

  closeRecordsBlock() {
    this.recordsBlock = false;
  }

  closeWindowAddedNewOrg() {
    this.windowAddingNewOrgIsOpen = false;
  }

  closeSettings() {
    this.settingsBtn = true;
    this.changeSettingsRecordsBlock = false;
    this.settingsRecords = false;
  }


  openClientList() {
    this.clientListBlock = true;
  }

  closeClientList() {
    this.clientListBlock = false;
  }
}
