# DataCalendarService

## Описание

`DataCalendarService` - это сервис для управления данными календаря в приложении. Он отвечает за получение, фильтрацию и управление записями пользователей, а также за взаимодействие с API и управление состоянием приложения.

## Основные функции

### Управление записями
- `getAllEntryAllUsersForTheMonth()` - получение всех записей всех пользователей за месяц
- `getAllEntryCurrentUsersThisMonth()` - получение записей текущего пользователя за месяц
- `deleteSelectedRecInAllRecBlock()` - удаление выбранной записи

### Управление пользователями
- `getAllUsersCurrentOrganization()` - получение всех пользователей текущей организации
- `getPhoneSelectedUser()` - получение телефона выбранного пользователя
- `checkingOrgHasEmployees()` - проверка наличия сотрудников в организации

### Фильтрация и отображение
- `filterRecCurrentUserByOrg()` - фильтрация записей по организации
- `filterRecCurrentUserByDate()` - фильтрация записей по дате
- `showAllRec()` - показ всех записей

### Настройки и конфигурация
- `getDataSetting()` - получение настроек для роли пользователя
- `routerLinkMain()` - навигация на главную страницу профиля

## Зависимости

- `ApiService` - для взаимодействия с API
- `DateService` - для управления датами и состоянием приложения

## BehaviorSubjects

Сервис использует следующие BehaviorSubjects для управления состоянием:

- `allEntryAllUsersInMonth` - все записи всех пользователей за месяц
- `allEntryCurrentUserThisMonth` - записи текущего пользователя за месяц
- `allUsersForShowAllFilter` - пользователи для фильтрации
- `filterByOrg` - флаг фильтрации по организации
- `filterByDate` - флаг фильтрации по дате
- `showAll` - флаг показа всех записей
- `arrayOfDays` - массив дней

## Тестирование

Сервис покрыт комплексными тестами трех уровней:

### 1. Unit Tests (`data-calendar.service.spec.ts`)
- Тестирование отдельных методов сервиса
- Mock-объекты для зависимостей
- Проверка корректности вызовов API
- Тестирование edge cases и обработки ошибок

### 2. Integration Tests (`data-calendar.service.integration.spec.ts`)
- Тестирование взаимодействия с реальными зависимостями
- Проверка интеграции с `ApiService` и `DateService`
- Тестирование HTTP запросов через `HttpClientTestingModule`

### 3. E2E Tests (`data-calendar.service.e2e.spec.ts`)
- Тестирование полных рабочих процессов
- Проверка состояния сервиса в различных сценариях
- Тестирование жизненного цикла сервиса

## Запуск тестов

```bash
# Запуск всех тестов для сервиса
ng test --include="**/data-calendar.service*.spec.ts" --watch=false

# Запуск только unit тестов
ng test --include="**/data-calendar.service.spec.ts" --watch=false

# Запуск только интеграционных тестов
ng test --include="**/data-calendar.service.integration.spec.ts" --watch=false

# Запуск только E2E тестов
ng test --include="**/data-calendar.service.e2e.spec.ts" --watch=false
```

## Покрытие тестами

Сервис покрыт тестами на 100% по следующим аспектам:

- ✅ Все публичные методы
- ✅ Все BehaviorSubjects и их инициализация
- ✅ Обработка ошибок API
- ✅ Edge cases (пустые массивы, null значения)
- ✅ Интеграция с зависимостями
- ✅ Управление состоянием
- ✅ Фильтрация и сортировка данных

## Примечания по использованию

1. **Обработка ошибок**: Сервис использует `catchError` для обработки ошибок API, поэтому методы не выбрасывают исключения
2. **Подписки**: Все API вызовы используют оператор `take(1)` для автоматической отписки
3. **Состояние**: Сервис поддерживает состояние через BehaviorSubjects, которые автоматически обновляются при изменении данных
4. **Фильтрация**: Фильтры работают независимо и могут комбинироваться

## Примеры использования

```typescript
// Получение записей всех пользователей
service.getAllEntryAllUsersForTheMonth();

// Подписка на изменения записей
service.allEntryAllUsersInMonth.subscribe(entries => {
  console.log('Новые записи:', entries);
});

// Фильтрация по организации
service.filterRecCurrentUserByOrg();

// Проверка наличия сотрудников
const hasEmployees = service.checkingOrgHasEmployees();
```

