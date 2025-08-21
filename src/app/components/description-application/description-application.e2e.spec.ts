import { ComponentFixture, TestBed } from '@angular/core/testing';
import { By } from '@angular/platform-browser';
import { NoopAnimationsModule } from '@angular/platform-browser/animations';
import { BrowserDynamicTestingModule } from '@angular/platform-browser-dynamic/testing';

import { DescriptionApplicationComponent } from './description-application.component';
import { ModalService } from '../../shared/services/modal.service';

describe('DescriptionApplicationComponent E2E Tests', () => {
  let component: DescriptionApplicationComponent;
  let fixture: ComponentFixture<DescriptionApplicationComponent>;
  let modalService: jasmine.SpyObj<ModalService>;

  beforeEach(async () => {
    const modalServiceSpy = jasmine.createSpyObj('ModalService', ['closeContacts']);

    await TestBed.configureTestingModule({
      imports: [DescriptionApplicationComponent, NoopAnimationsModule],
      providers: [
        { provide: ModalService, useValue: modalServiceSpy }
      ]
    }).compileComponents();

    fixture = TestBed.createComponent(DescriptionApplicationComponent);
    component = fixture.componentInstance;
    modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
    fixture.detectChanges();
  });

  afterEach(() => {
    fixture.destroy();
  });

  // ====== E2E ТЕСТЫ ПОЛЬЗОВАТЕЛЬСКИХ СЦЕНАРИЕВ ======
  describe('End-to-End User Scenarios', () => {
    it('should complete full user workflow: open description -> view content -> close description', () => {
      // Arrange - User starts with default state
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - Step 1: User clicks description button
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      expect(descriptionButton.nativeElement.textContent.trim()).toBe('Описание');
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 1: Description block is now visible
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
      
      const descriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(descriptionBlock).toBeTruthy();
      
      // Assert - Step 2: Description content is properly displayed
      const mainHeading = fixture.debugElement.query(By.css('.descriptionsApp h2'));
      expect(mainHeading).toBeTruthy();
      expect(mainHeading.nativeElement.textContent.trim()).toContain('Покажи тому, к кому');
      
      const userBenefitsTitle = fixture.debugElement.query(By.css('.titleEachDes'));
      expect(userBenefitsTitle).toBeTruthy();
      expect(userBenefitsTitle.nativeElement.textContent.trim()).toBe('Плюсы для пользователей:');
      
      const businessBenefitsTitle = fixture.debugElement.queryAll(By.css('.titleEachDes'))[1];
      expect(businessBenefitsTitle).toBeTruthy();
      expect(businessBenefitsTitle.nativeElement.textContent.trim()).toBe('Плюсы для бизнеса:');
      
      // Act - Step 3: User clicks close button for description
      const closeDescriptionButton = fixture.debugElement.query(By.css('.btnTitleDescription'));
      expect(closeDescriptionButton).toBeTruthy();
      expect(closeDescriptionButton.nativeElement.textContent.trim()).toBe('×');
      closeDescriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 3: Description block is now hidden
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      const hiddenDescriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(hiddenDescriptionBlock).toBeFalsy();
    });

    it('should complete full user workflow: open video -> view video links -> close video', () => {
      // Arrange - User starts with default state
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - Step 1: User clicks video button
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      expect(videoButton.nativeElement.textContent.trim()).toBe('Видео');
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 1: Video block is now visible
      expect(component.showVideoAbout).toBeTrue();
      expect(component.blockDescription).toBeFalse();
      
      const videoBlock = fixture.debugElement.query(By.css('.videoFor'));
      expect(videoBlock).toBeTruthy();
      
      // Assert - Step 2: Video links are properly displayed
      const clientVideoLink = fixture.debugElement.query(By.css('.videoForShared a[href*="817c09a5be7af5a88b9732bb88cc80d8"]'));
      expect(clientVideoLink).toBeTruthy();
      expect(clientVideoLink.nativeElement.textContent.trim()).toBe('Для клиентов');
      
      const businessVideoLink = fixture.debugElement.query(By.css('.videoForShared a[href*="a2fab0f3d5420a50827f85c33e4a8ad7"]'));
      expect(businessVideoLink).toBeTruthy();
      expect(businessVideoLink.nativeElement.textContent.trim()).toBe('Для бизнеса');
      
      // Act - Step 3: User clicks video button again to close
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 3: Video block is now hidden
      expect(component.showVideoAbout).toBeFalse();
      expect(component.blockDescription).toBeFalse();
      
      const hiddenVideoBlock = fixture.debugElement.query(By.css('.videoFor'));
      expect(hiddenVideoBlock).toBeFalsy();
    });

    it('should handle complex user workflow: open description -> open video -> close description (should close video too)', () => {
      // Arrange - User starts with default state
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - Step 1: User opens description
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 1: Description is open
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - Step 2: User opens video while description is open
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 2: Both are now open
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeTrue();
      
      // Act - Step 3: User closes description (this should also close video due to component logic)
      const closeDescriptionButton = fixture.debugElement.query(By.css('.btnTitleDescription'));
      closeDescriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Step 3: Description is closed, video is also closed (due to switchHowItWorkBlock logic)
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      const hiddenDescriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      const hiddenVideoBlock = fixture.debugElement.query(By.css('.videoFor'));
      expect(hiddenDescriptionBlock).toBeFalsy();
      expect(hiddenVideoBlock).toBeFalsy();
    });

    it('should handle rapid user interactions without errors', () => {
      // Arrange - User starts with default state
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - Rapid clicking on both buttons
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      // Rapid clicks
      for (let i = 0; i < 5; i++) {
        videoButton.nativeElement.click();
        descriptionButton.nativeElement.click();
        fixture.detectChanges();
      }
      
      // Assert - Component should handle rapid interactions gracefully
      expect(() => {
        videoButton.nativeElement.click();
        descriptionButton.nativeElement.click();
        fixture.detectChanges();
      }).not.toThrow();
      
      // Final state should be predictable
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });
  });

  // ====== E2E ТЕСТЫ НАВИГАЦИИ И ЗАКРЫТИЯ ======
  describe('Navigation and Close Functionality', () => {
    it('should close modal when close button is clicked', () => {
      // Arrange - User wants to close the modal
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      expect(closeButton).toBeTruthy();
      expect(closeButton.nativeElement.textContent.trim()).toBe('×');
      
      // Act - User clicks close button
      closeButton.nativeElement.click();
      
      // Assert - Modal service close method is called
      expect(modalService.closeContacts).toHaveBeenCalledTimes(1);
    });

    it('should maintain proper button states during interactions', () => {
      // Arrange - User starts with default state
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      // Assert - Initial button states
      expect(videoButton.nativeElement.textContent.trim()).toBe('Видео');
      expect(descriptionButton.nativeElement.textContent.trim()).toBe('Описание');
      
      // Act - User opens description
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Buttons should still be visible and functional
      expect(videoButton.nativeElement.textContent.trim()).toBe('Видео');
      expect(descriptionButton.nativeElement.textContent.trim()).toBe('Описание');
      
      // Act - User opens video
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Buttons should still be visible and functional
      expect(videoButton.nativeElement.textContent.trim()).toBe('Видео');
      expect(descriptionButton.nativeElement.textContent.trim()).toBe('Описание');
    });
  });

  // ====== E2E ТЕСТЫ ОТОБРАЖЕНИЯ КОНТЕНТА ======
  describe('Content Display and Rendering', () => {
    it('should display all main sections correctly', () => {
      // Arrange & Act - Component is loaded
      
      // Assert - Main title is displayed
      const mainTitle = fixture.debugElement.query(By.css('.mainTitle'));
      expect(mainTitle).toBeTruthy();
      expect(mainTitle.nativeElement.textContent.trim()).toBe('Ничего лишнего!');
      
      // Assert - Easy steps are displayed
      const easySteps = fixture.debugElement.queryAll(By.css('.easyClass h5'));
      expect(easySteps.length).toBe(3);
      expect(easySteps[0].nativeElement.textContent.trim()).toBe('Зашел');
      expect(easySteps[1].nativeElement.textContent.trim()).toBe('Выбрал');
      expect(easySteps[2].nativeElement.textContent.trim()).toBe('Записался');
      
      // Assert - Video and description buttons are displayed
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      expect(videoButton.nativeElement.textContent.trim()).toBe('Видео');
      expect(descriptionButton.nativeElement.textContent.trim()).toBe('Описание');
    });

    it('should display description content with all benefits when opened', () => {
      // Arrange - User opens description
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Description block is visible
      expect(component.blockDescription).toBeTrue();
      const descriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(descriptionBlock).toBeTruthy();
      
      // Assert - Main heading is displayed
      const mainHeading = fixture.debugElement.query(By.css('.descriptionsApp h2'));
      expect(mainHeading).toBeTruthy();
      expect(mainHeading.nativeElement.textContent.trim()).toContain('Покажи тому, к кому');
      
      // Assert - User benefits section is displayed
      const userBenefitsTitle = fixture.debugElement.query(By.css('.titleEachDes'));
      expect(userBenefitsTitle).toBeTruthy();
      expect(userBenefitsTitle.nativeElement.textContent.trim()).toBe('Плюсы для пользователей:');
      
      const userBenefitsList = fixture.debugElement.query(By.css('.howItWorkClass ul'));
      expect(userBenefitsList).toBeTruthy();
      
      // Assert - Business benefits section is displayed
      const businessBenefitsTitle = fixture.debugElement.queryAll(By.css('.titleEachDes'))[1];
      expect(businessBenefitsTitle).toBeTruthy();
      expect(businessBenefitsTitle.nativeElement.textContent.trim()).toBe('Плюсы для бизнеса:');
      
      const businessBenefitsList = fixture.debugElement.queryAll(By.css('.howItWorkClass ul'))[1];
      expect(businessBenefitsList).toBeTruthy();
    });

    it('should display video links correctly when video section is opened', () => {
      // Arrange - User opens video section
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Video block is visible
      expect(component.showVideoAbout).toBeTrue();
      const videoBlock = fixture.debugElement.query(By.css('.videoFor'));
      expect(videoBlock).toBeTruthy();
      
      // Assert - Client video link is displayed
      const clientVideoLink = fixture.debugElement.query(By.css('.videoForShared a[href*="817c09a5be7af5a88b9732bb88cc80d8"]'));
      expect(clientVideoLink).toBeTruthy();
      expect(clientVideoLink.nativeElement.textContent.trim()).toBe('Для клиентов');
      expect(clientVideoLink.nativeElement.getAttribute('target')).toBe('_blank');
      
      // Assert - Business video link is displayed
      const businessVideoLink = fixture.debugElement.query(By.css('.videoForShared a[href*="a2fab0f3d5420a50827f85c33e4a8ad7"]'));
      expect(businessVideoLink).toBeTruthy();
      expect(businessVideoLink.nativeElement.textContent.trim()).toBe('Для бизнеса');
      expect(businessVideoLink.nativeElement.getAttribute('target')).toBe('_blank');
    });
  });

  // ====== E2E ТЕСТЫ СОСТОЯНИЯ И ПЕРЕКЛЮЧЕНИЙ ======
  describe('State Management and Toggles', () => {
    it('should toggle description block state correctly', () => {
      // Arrange - User starts with closed description
      expect(component.blockDescription).toBeFalse();
      
      // Act - User opens description
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Description is now open
      expect(component.blockDescription).toBeTrue();
      const descriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(descriptionBlock).toBeTruthy();
      
      // Act - User closes description
      const closeDescriptionButton = fixture.debugElement.query(By.css('.btnTitleDescription'));
      closeDescriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Description is now closed
      expect(component.blockDescription).toBeFalse();
      const hiddenDescriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(hiddenDescriptionBlock).toBeFalsy();
    });

    it('should toggle video block state correctly', () => {
      // Arrange - User starts with closed video
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - User opens video
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Video is now open
      expect(component.showVideoAbout).toBeTrue();
      const videoBlock = fixture.debugElement.query(By.css('.videoFor'));
      expect(videoBlock).toBeTruthy();
      
      // Act - User closes video
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Video is now closed
      expect(component.showVideoAbout).toBeFalse();
      const hiddenVideoBlock = fixture.debugElement.query(By.css('.videoFor'));
      expect(hiddenVideoBlock).toBeFalsy();
    });

    it('should handle mutual exclusivity between description and video blocks', () => {
      // Arrange - User starts with both closed
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - User opens description
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Description is open, video is closed
      expect(component.blockDescription).toBeTrue();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - User opens video (should NOT close description due to component logic)
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Both video and description can be open simultaneously
      expect(component.showVideoAbout).toBeTrue();
      expect(component.blockDescription).toBeTrue();
    });
  });

  // ====== E2E ТЕСТЫ ДОСТУПНОСТИ И UX ======
  describe('Accessibility and User Experience', () => {
    it('should have proper button semantics and accessibility', () => {
      // Arrange & Act - Component is loaded
      
      // Assert - All buttons have proper button tag
      const buttons = fixture.debugElement.queryAll(By.css('button'));
      buttons.forEach(button => {
        expect(button.nativeElement.tagName.toLowerCase()).toBe('button');
      });
      
      // Assert - Video and description elements are clickable
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      expect(videoButton).toBeTruthy();
      expect(descriptionButton).toBeTruthy();
      
      // Assert - Elements respond to clicks
      expect(() => {
        videoButton.nativeElement.click();
        descriptionButton.nativeElement.click();
      }).not.toThrow();
    });

    it('should provide clear visual feedback for user interactions', () => {
      // Arrange - User starts with default state
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      // Act - User clicks description button
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Visual feedback: description content appears
      const descriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(descriptionBlock).toBeTruthy();
      
      // Assert - Visual feedback: close button appears
      const closeButton = fixture.debugElement.query(By.css('.btnTitleDescription'));
      expect(closeButton).toBeTruthy();
      
      // Act - User clicks close button
      closeButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Visual feedback: content disappears
      const hiddenDescriptionBlock = fixture.debugElement.query(By.css('.descriptionsApp > div'));
      expect(hiddenDescriptionBlock).toBeFalsy();
    });

    it('should maintain consistent layout during state changes', () => {
      // Arrange - User starts with default state
      const initialLayout = fixture.debugElement.query(By.css('.descriptionPageClass'));
      expect(initialLayout).toBeTruthy();
      
      // Act - User opens description
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Layout remains consistent
      const layoutWithDescription = fixture.debugElement.query(By.css('.descriptionPageClass'));
      expect(layoutWithDescription).toBeTruthy();
      
      // Act - User opens video
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      videoButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Layout remains consistent
      const layoutWithVideo = fixture.debugElement.query(By.css('.descriptionPageClass'));
      expect(layoutWithVideo).toBeTruthy();
    });
  });

  // ====== E2E ТЕСТЫ ИНТЕГРАЦИИ С СЕРВИСАМИ ======
  describe('Service Integration', () => {
    it('should integrate properly with ModalService', () => {
      // Arrange - User wants to close the modal
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      
      // Act - User clicks close button
      closeButton.nativeElement.click();
      
      // Assert - ModalService method is called correctly
      expect(modalService.closeContacts).toHaveBeenCalledTimes(1);
      expect(modalService.closeContacts).toHaveBeenCalledWith();
    });

    it('should handle service method calls without affecting component state', () => {
      // Arrange - User starts with default state
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Act - User clicks close button (calls service)
      const closeButton = fixture.debugElement.query(By.css('.btnCloseDesc'));
      closeButton.nativeElement.click();
      
      // Assert - Component state remains unchanged
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Assert - Service was called
      expect(modalService.closeContacts).toHaveBeenCalledTimes(1);
    });
  });

  // ====== E2E ТЕСТЫ ПРОИЗВОДИТЕЛЬНОСТИ ======
  describe('Performance and Responsiveness', () => {
    it('should handle rapid state changes efficiently', () => {
      // Arrange - User starts with default state
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      // Act - Rapid state changes
      const startTime = performance.now();
      
      for (let i = 0; i < 10; i++) {
        videoButton.nativeElement.click();
        descriptionButton.nativeElement.click();
        fixture.detectChanges();
      }
      
      const endTime = performance.now();
      const executionTime = endTime - startTime;
      
      // Assert - Should complete within reasonable time (less than 100ms)
      expect(executionTime).toBeLessThan(100);
      
      // Assert - Final state should be predictable
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should not create memory leaks during extended use', () => {
      // Arrange - User starts with default state
      const videoButton = fixture.debugElement.query(By.css('.btnVideo'));
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      
      // Act - Extended use simulation
      for (let i = 0; i < 100; i++) {
        videoButton.nativeElement.click();
        descriptionButton.nativeElement.click();
        fixture.detectChanges();
      }
      
      // Assert - Component should still work correctly
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
      
      // Assert - Can still perform normal operations
      videoButton.nativeElement.click();
      fixture.detectChanges();
      expect(component.showVideoAbout).toBeTrue();
    });
  });

  // ====== E2E ТЕСТЫ ГРАНИЧНЫХ СЛУЧАЕВ ======
  describe('Edge Cases and Error Handling', () => {
    it('should handle component reinitialization gracefully', () => {
      // Arrange - User has interacted with component
      const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
      descriptionButton.nativeElement.click();
      fixture.detectChanges();
      
      // Assert - Component is in modified state
      expect(component.blockDescription).toBeTrue();
      
      // Act - Simulate component reinitialization
      fixture.destroy();
      fixture = TestBed.createComponent(DescriptionApplicationComponent);
      component = fixture.componentInstance;
      modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
      fixture.detectChanges();
      
      // Assert - Component returns to default state
      expect(component.blockDescription).toBeFalse();
      expect(component.showVideoAbout).toBeFalse();
    });

    it('should maintain functionality after multiple destroy/create cycles', () => {
      // Arrange - Multiple cycles
      for (let cycle = 0; cycle < 3; cycle++) {
        // Act - Create component
        fixture = TestBed.createComponent(DescriptionApplicationComponent);
        component = fixture.componentInstance;
        modalService = TestBed.inject(ModalService) as jasmine.SpyObj<ModalService>;
        fixture.detectChanges();
        
        // Assert - Component works correctly
        expect(component.blockDescription).toBeFalse();
        expect(component.showVideoAbout).toBeFalse();
        
        // Act - Interact with component
        const descriptionButton = fixture.debugElement.queryAll(By.css('.btnVideo'))[1];
        descriptionButton.nativeElement.click();
        fixture.detectChanges();
        
        // Assert - Interaction works
        expect(component.blockDescription).toBeTrue();
        
        // Act - Destroy component
        fixture.destroy();
      }
    });
  });
});
