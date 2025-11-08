UserAuthentication.register { username: 'Jake', password: 'hi' } => { user: '019a6183-5511-7d21-aa85-39f1418186e6' }
Requesting.respond {
  request: '019a6183-547f-7fc7-b5e5-5a2a20732777',
  user: '019a6183-5511-7d21-aa85-39f1418186e6'
} => { request: '019a6183-547f-7fc7-b5e5-5a2a20732777' }
[Requesting] Received request for path: /UserAuthentication/login
Requesting.request { username: 'Jake', password: 'hi', path: '/UserAuthentication/login' } => { request: '019a6183-72d2-7eea-ab4b-124f6ea07f04' }
UserAuthentication.login { username: 'Jake', password: 'hi' } => { user: '019a6183-5511-7d21-aa85-39f1418186e6' }
Sessioning.create { user: '019a6183-5511-7d21-aa85-39f1418186e6' } => { session: '019a6183-735d-77f3-a53f-4d617488a28a' }
Requesting.respond {
  request: '019a6183-72d2-7eea-ab4b-124f6ea07f04',
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  user: '019a6183-5511-7d21-aa85-39f1418186e6'
} => { request: '019a6183-72d2-7eea-ab4b-124f6ea07f04' }
[Requesting] Received request for path: /QuickCheckIns/_listMetricsForOwner
[Requesting] Received request for path: /MealLog/_getMealsByOwner
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
[Requesting] Received request for path: /QuickCheckIns/_listMetricsForOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6183-74ec-734c-810e-1c2b489cc592' }
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  path: '/QuickCheckIns/_listMetricsForOwner'
} => { request: '019a6183-74eb-706a-aedc-f5d537b6655c' }
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6183-74ee-76fe-946b-07a4a392d82f' }
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  path: '/QuickCheckIns/_listMetricsForOwner'
} => { request: '019a6183-7507-788d-9a5c-e7ae81073a09' }
[Requesting] Received request for path: /QuickCheckIns/_listMetricsForOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  path: '/QuickCheckIns/_listMetricsForOwner'
} => { request: '019a6183-754e-7dfb-8811-e8fa10da95e8' }
Requesting.respond {
  request: '019a6183-74ec-734c-810e-1c2b489cc592',
  meals: Frames(0) []
} => { request: '019a6183-74ec-734c-810e-1c2b489cc592' }
Requesting.respond { request: '019a6183-74eb-706a-aedc-f5d537b6655c', metrics: [] } => { request: '019a6183-74eb-706a-aedc-f5d537b6655c' }
Requesting.respond { request: '019a6183-74ee-76fe-946b-07a4a392d82f', checkIns: [] } => { request: '019a6183-74ee-76fe-946b-07a4a392d82f' }
Requesting.respond { request: '019a6183-7507-788d-9a5c-e7ae81073a09', metrics: [] } => { request: '019a6183-7507-788d-9a5c-e7ae81073a09' }
Requesting.respond { request: '019a6183-754e-7dfb-8811-e8fa10da95e8', metrics: [] } => { request: '019a6183-754e-7dfb-8811-e8fa10da95e8' }
[Requesting] Received request for path: /QuickCheckIns/defineMetric
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  name: 'sleep (/10)',
  requester: '019a6183-5511-7d21-aa85-39f1418186e6',
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  path: '/QuickCheckIns/defineMetric'
} => { request: '019a6183-a37b-7716-88dc-e82fe0168ebb' }
QuickCheckIns.defineMetric { owner: '019a6183-5511-7d21-aa85-39f1418186e6', name: 'sleep (/10)' } => { metric: '019a6183-a492-7706-be74-209901e33f1d' }
Requesting.respond {
  request: '019a6183-a37b-7716-88dc-e82fe0168ebb',
  metric: '019a6183-a492-7706-be74-209901e33f1d'
} => { request: '019a6183-a37b-7716-88dc-e82fe0168ebb' }
[Requesting] Received request for path: /QuickCheckIns/_listMetricsForOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  path: '/QuickCheckIns/_listMetricsForOwner'
} => { request: '019a6183-a618-73f4-842d-8540a9d9a95f' }
Requesting.respond {
  request: '019a6183-a618-73f4-842d-8540a9d9a95f',
  metrics: [
    {
      _id: '019a6183-a492-7706-be74-209901e33f1d',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      name: 'sleep (/10)'
    }
  ]
} => { request: '019a6183-a618-73f4-842d-8540a9d9a95f' }
[Requesting] Received request for path: /QuickCheckIns/_getMetricsByName
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  name: 'sleep (/10)',
  path: '/QuickCheckIns/_getMetricsByName'
} => { request: '019a6183-a85e-7b77-b99e-26f19c2b878a' }
Requesting.respond {
  request: '019a6183-a85e-7b77-b99e-26f19c2b878a',
  metrics: [
    {
      _id: '019a6183-a492-7706-be74-209901e33f1d',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      name: 'sleep (/10)'
    }
  ]
} => { request: '019a6183-a85e-7b77-b99e-26f19c2b878a' }
[Requesting] Received request for path: /QuickCheckIns/record
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  value: 9,
  at: '2025-11-08T03:30:12.000Z',
  path: '/QuickCheckIns/record'
} => { request: '019a6183-baa9-7d16-a164-9ce2d5dd98fa' }
QuickCheckIns.record {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  at: '2025-11-08T03:30:12.000Z',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  value: 9
} => { checkIn: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c' }
Requesting.respond {
  request: '019a6183-baa9-7d16-a164-9ce2d5dd98fa',
  checkIn: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c'
} => { request: '019a6183-baa9-7d16-a164-9ce2d5dd98fa' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6183-bd42-7882-a627-47094fd1557a' }
Requesting.respond {
  request: '019a6183-bd42-7882-a627-47094fd1557a',
  checkIns: [
    {
      _id: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:30:12.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    }
  ]
} => { request: '019a6183-bd42-7882-a627-47094fd1557a' }
[Requesting] Received request for path: /QuickCheckIns/edit
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  checkInId: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
  checkIn: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
  id: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
  value: 10,
  newValue: 10,
  newTimestamp: 1762572612,
  timestamp: 1762572612,
  newTimestampSeconds: 1762572612,
  timestampSeconds: 1762572612,
  newTimestampMs: 1762572612000,
  timestampMs: 1762572612000,
  newDate: 1762572612000,
  date: 1762572612000,
  newTime: 1762572612000,
  time: 1762572612000,
  newWhen: '2025-11-08T03:30:12.000Z',
  when: '2025-11-08T03:30:12.000Z',
  newAt: '2025-11-08T03:30:12.000Z',
  at: '2025-11-08T03:30:12.000Z',
  updatedAt: '2025-11-08T03:30:12.000Z',
  ts: 1762572612,
  tsMs: 1762572612000,
  new_ts: 1762572612,
  path: '/QuickCheckIns/edit'
} => { request: '019a6183-dcf3-76b2-bcde-af288ece7167' }
QuickCheckIns.edit {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  checkIn: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
  value: 10
} => {}
Requesting.respond { request: '019a6183-dcf3-76b2-bcde-af288ece7167', success: true } => { request: '019a6183-dcf3-76b2-bcde-af288ece7167' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6183-dfa7-7b07-b09e-4a9bb4d96a62' }
Requesting.respond {
  request: '019a6183-dfa7-7b07-b09e-4a9bb4d96a62',
  checkIns: [
    {
      _id: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:30:12.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 10
    }
  ]
} => { request: '019a6183-dfa7-7b07-b09e-4a9bb4d96a62' }
[Requesting] Received request for path: /QuickCheckIns/delete
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  checkIn: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
  checkInId: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
  id: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c',
  path: '/QuickCheckIns/delete'
} => { request: '019a6183-fa0e-7762-a12e-c1801edf5229' }
QuickCheckIns.delete {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  checkIn: '019a6183-bbb8-7b10-9dc4-8239b7b74d9c'
} => {}
Requesting.respond { request: '019a6183-fa0e-7762-a12e-c1801edf5229', success: true } => { request: '019a6183-fa0e-7762-a12e-c1801edf5229' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6183-fcec-709b-b6ca-36ce1f54b440' }
Requesting.respond { request: '019a6183-fcec-709b-b6ca-36ce1f54b440', checkIns: [] } => { request: '019a6183-fcec-709b-b6ca-36ce1f54b440' }
[Requesting] Received request for path: /MealLog/_getMealsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6184-0211-7ac1-98d6-dc8590dbdff6' }
Requesting.respond {
  request: '019a6184-0211-7ac1-98d6-dc8590dbdff6',
  meals: Frames(0) []
} => { request: '019a6184-0211-7ac1-98d6-dc8590dbdff6' }
[Requesting] Received request for path: /MealLog/submit
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  at: '2025-11-08T03:30:00.000Z',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:apple', name: 'Apple' }
  ],
  path: '/MealLog/submit'
} => { request: '019a6184-1ab5-754b-9eb1-4145e2bc9b7d' }
MealLog.submit {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  at: '2025-11-08T03:30:00.000Z',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:apple', name: 'Apple' }
  ]
} => { meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6' }
Requesting.respond {
  request: '019a6184-1ab5-754b-9eb1-4145e2bc9b7d',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6'
} => { request: '019a6184-1ab5-754b-9eb1-4145e2bc9b7d' }
[Requesting] Received request for path: /MealLog/_getMealsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6184-1d4b-7fb3-bc8b-f88d7dde87eb' }
Requesting.respond {
  request: '019a6184-1d4b-7fb3-bc8b-f88d7dde87eb',
  meals: Frames(1) [
    {
      _id: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:30:00.000Z',
      items: [Array],
      notes: null,
      status: 'ACTIVE'
    }
  ]
} => { request: '019a6184-1d4b-7fb3-bc8b-f88d7dde87eb' }
[Requesting] Received request for path: /MealLog/_getMealById
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  path: '/MealLog/_getMealById'
} => { request: '019a6184-2409-77b0-beca-4b4dec7f135d' }
Requesting.respond {
  request: '019a6184-2409-77b0-beca-4b4dec7f135d',
  meal: {
    _id: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
    owner: '019a6183-5511-7d21-aa85-39f1418186e6',
    at: '2025-11-08T03:30:00.000Z',
    items: [ [Object], [Object] ],
    notes: null,
    status: 'ACTIVE'
  }
} => { request: '019a6184-2409-77b0-beca-4b4dec7f135d' }
[Requesting] Received request for path: /MealLog/edit
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:lemon', name: 'Lemon' }
  ],
  at: '2025-11-08T03:30:00.000Z',
  path: '/MealLog/edit'
} => { request: '019a6184-3332-71b7-9798-5eceae827dbf' }
MealLog.edit {
  caller: '019a6183-5511-7d21-aa85-39f1418186e6',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  at: '2025-11-08T03:30:00.000Z',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:lemon', name: 'Lemon' }
  ]
} => {}
Requesting.respond { request: '019a6184-3332-71b7-9798-5eceae827dbf', status: 'ok' } => { request: '019a6184-3332-71b7-9798-5eceae827dbf' }
[Requesting] Received request for path: /MealLog/_getMealById
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  path: '/MealLog/_getMealById'
} => { request: '019a6184-35af-7249-8083-7fca4d10f908' }
Requesting.respond {
  request: '019a6184-35af-7249-8083-7fca4d10f908',
  meal: {
    _id: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
    owner: '019a6183-5511-7d21-aa85-39f1418186e6',
    at: '2025-11-08T03:30:00.000Z',
    items: [ [Object], [Object] ],
    notes: null,
    status: 'ACTIVE'
  }
} => { request: '019a6184-35af-7249-8083-7fca4d10f908' }
[Requesting] Received request for path: /MealLog/_getMealsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6184-381c-791a-8090-c351d117d08a' }
Requesting.respond {
  request: '019a6184-381c-791a-8090-c351d117d08a',
  meals: Frames(1) [
    {
      _id: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:30:00.000Z',
      items: [Array],
      notes: null,
      status: 'ACTIVE'
    }
  ]
} => { request: '019a6184-381c-791a-8090-c351d117d08a' }
[Requesting] Received request for path: /MealLog/edit
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:lemon', name: 'Lemon' }
  ],
  at: '2025-11-07T03:30:00.000Z',
  path: '/MealLog/edit'
} => { request: '019a6184-45c7-7176-9ce7-1e2c0aab2724' }
MealLog.edit {
  caller: '019a6183-5511-7d21-aa85-39f1418186e6',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  at: '2025-11-07T03:30:00.000Z',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:lemon', name: 'Lemon' }
  ]
} => {}
Requesting.respond { request: '019a6184-45c7-7176-9ce7-1e2c0aab2724', status: 'ok' } => { request: '019a6184-45c7-7176-9ce7-1e2c0aab2724' }
[Requesting] Received request for path: /MealLog/_getMealById
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  path: '/MealLog/_getMealById'
} => { request: '019a6184-48fc-7663-b344-9f77d3e9531b' }
Requesting.respond {
  request: '019a6184-48fc-7663-b344-9f77d3e9531b',
  meal: {
    _id: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
    owner: '019a6183-5511-7d21-aa85-39f1418186e6',
    at: '2025-11-07T03:30:00.000Z',
    items: [ [Object], [Object] ],
    notes: null,
    status: 'ACTIVE'
  }
} => { request: '019a6184-48fc-7663-b344-9f77d3e9531b' }
[Requesting] Received request for path: /MealLog/_getMealsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6184-4ae1-78b2-99d5-a0c92b4e8366' }
Requesting.respond {
  request: '019a6184-4ae1-78b2-99d5-a0c92b4e8366',
  meals: Frames(1) [
    {
      _id: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-07T03:30:00.000Z',
      items: [Array],
      notes: null,
      status: 'ACTIVE'
    }
  ]
} => { request: '019a6184-4ae1-78b2-99d5-a0c92b4e8366' }
[Requesting] Received request for path: /MealLog/delete
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6',
  path: '/MealLog/delete'
} => { request: '019a6184-4f17-771d-ba7f-7aeb89d592b0' }
MealLog.delete {
  caller: '019a6183-5511-7d21-aa85-39f1418186e6',
  meal: '019a6184-1b80-71ee-9bbf-ffc278e551b6'
} => {}
Requesting.respond { request: '019a6184-4f17-771d-ba7f-7aeb89d592b0', status: 'deleted' } => { request: '019a6184-4f17-771d-ba7f-7aeb89d592b0' }
[Requesting] Received request for path: /MealLog/submit
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  at: '2025-11-08T03:30:00.000Z',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:apple', name: 'Apple' }
  ],
  path: '/MealLog/submit'
} => { request: '019a6184-6260-7a98-839e-639f2a195f72' }
MealLog.submit {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  at: '2025-11-08T03:30:00.000Z',
  items: [
    { id: 'type:dinner', name: 'Dinner' },
    { id: 'food:apple', name: 'Apple' }
  ]
} => { meal: '019a6184-6339-7b98-9b70-ef3ec5a10ee3' }
Requesting.respond {
  request: '019a6184-6260-7a98-839e-639f2a195f72',
  meal: '019a6184-6339-7b98-9b70-ef3ec5a10ee3'
} => { request: '019a6184-6260-7a98-839e-639f2a195f72' }
[Requesting] Received request for path: /MealLog/_getMealsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6184-653f-7d39-90d8-414229912729' }
Requesting.respond {
  request: '019a6184-653f-7d39-90d8-414229912729',
  meals: Frames(1) [
    {
      _id: '019a6184-6339-7b98-9b70-ef3ec5a10ee3',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:30:00.000Z',
      items: [Array],
      notes: null,
      status: 'ACTIVE'
    }
  ]
} => { request: '019a6184-653f-7d39-90d8-414229912729' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6184-6a1e-7965-9b52-e86f3117a18c' }
Requesting.respond { request: '019a6184-6a1e-7965-9b52-e86f3117a18c', checkIns: [] } => { request: '019a6184-6a1e-7965-9b52-e86f3117a18c' }
[Requesting] Received request for path: /QuickCheckIns/record
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  value: 9,
  at: '2025-11-08T03:31:04.000Z',
  path: '/QuickCheckIns/record'
} => { request: '019a6184-8193-74f0-aad2-622bc9c91c98' }
[Requesting] Received request for path: /QuickCheckIns/record
QuickCheckIns.record {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  at: '2025-11-08T03:31:04.000Z',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  value: 9
} => { checkIn: '019a6184-82a2-7a3a-8ebd-d12ea4156dca' }
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  value: 9,
  at: '2025-11-08T03:31:04.000Z',
  path: '/QuickCheckIns/record'
} => { request: '019a6184-82c3-75f3-b283-51480e9f8a9b' }
Requesting.respond {
  request: '019a6184-8193-74f0-aad2-622bc9c91c98',
  checkIn: '019a6184-82a2-7a3a-8ebd-d12ea4156dca'
} => { request: '019a6184-8193-74f0-aad2-622bc9c91c98' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
QuickCheckIns.record {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  at: '2025-11-08T03:31:04.000Z',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  value: 9
} => { checkIn: '019a6184-83c9-7cc5-b931-3cee27ab0360' }
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6184-840b-7b02-b68d-c26cc0a8e6f5' }
Requesting.respond {
  request: '019a6184-82c3-75f3-b283-51480e9f8a9b',
  checkIn: '019a6184-83c9-7cc5-b931-3cee27ab0360'
} => { request: '019a6184-82c3-75f3-b283-51480e9f8a9b' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6184-84c6-71a2-b819-4f43971fe7a0' }
Requesting.respond {
  request: '019a6184-840b-7b02-b68d-c26cc0a8e6f5',
  checkIns: [
    {
      _id: '019a6184-82a2-7a3a-8ebd-d12ea4156dca',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    },
    {
      _id: '019a6184-83c9-7cc5-b931-3cee27ab0360',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    }
  ]
} => { request: '019a6184-840b-7b02-b68d-c26cc0a8e6f5' }
Requesting.respond {
  request: '019a6184-84c6-71a2-b819-4f43971fe7a0',
  checkIns: [
    {
      _id: '019a6184-82a2-7a3a-8ebd-d12ea4156dca',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    },
    {
      _id: '019a6184-83c9-7cc5-b931-3cee27ab0360',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    }
  ]
} => { request: '019a6184-84c6-71a2-b819-4f43971fe7a0' }
[Requesting] Received request for path: /QuickCheckIns/_getMetricsByName
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  name: 'sleep (/10)',
  path: '/QuickCheckIns/_getMetricsByName'
} => { request: '019a6184-86cd-71c4-8ae6-7d63ae5faaf9' }
Requesting.respond {
  request: '019a6184-86cd-71c4-8ae6-7d63ae5faaf9',
  metrics: [
    {
      _id: '019a6183-a492-7706-be74-209901e33f1d',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      name: 'sleep (/10)'
    }
  ]
} => { request: '019a6184-86cd-71c4-8ae6-7d63ae5faaf9' }
[Requesting] Received request for path: /MealLog/_getMealsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6184-8b4f-7ead-9b6f-c7068c5bed06' }
Requesting.respond {
  request: '019a6184-8b4f-7ead-9b6f-c7068c5bed06',
  meals: Frames(1) [
    {
      _id: '019a6184-6339-7b98-9b70-ef3ec5a10ee3',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:30:00.000Z',
      items: [Array],
      notes: null,
      status: 'ACTIVE'
    }
  ]
} => { request: '019a6184-8b4f-7ead-9b6f-c7068c5bed06' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
[Requesting] Received request for path: /QuickCheckIns/_listMetricsForOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6184-8dec-7211-acd3-27dce67ca94a' }
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  path: '/QuickCheckIns/_listMetricsForOwner'
} => { request: '019a6184-8e1f-7954-92be-9d93081c6b39' }
Requesting.respond {
  request: '019a6184-8dec-7211-acd3-27dce67ca94a',
  checkIns: [
    {
      _id: '019a6184-82a2-7a3a-8ebd-d12ea4156dca',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    },
    {
      _id: '019a6184-83c9-7cc5-b931-3cee27ab0360',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    }
  ]
} => { request: '019a6184-8dec-7211-acd3-27dce67ca94a' }
Requesting.respond {
  request: '019a6184-8e1f-7954-92be-9d93081c6b39',
  metrics: [
    {
      _id: '019a6183-a492-7706-be74-209901e33f1d',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      name: 'sleep (/10)'
    }
  ]
} => { request: '019a6184-8e1f-7954-92be-9d93081c6b39' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  startDate: 1762056000000,
  endDate: 1762577999999,
  start: 1762056000000,
  end: 1762577999999,
  startAt: 1762056000000,
  endAt: 1762577999999,
  startTime: 1762056000000,
  endTime: 1762577999999,
  from: 1762056000000,
  to: 1762577999999,
  rangeStart: 1762056000000,
  rangeEnd: 1762577999999,
  startSeconds: 1762056000,
  endSeconds: 1762577999,
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6184-8fe5-746e-8578-5f10962eaf33' }
Requesting.respond {
  request: '019a6184-8fe5-746e-8578-5f10962eaf33',
  checkIns: [
    {
      _id: '019a6184-82a2-7a3a-8ebd-d12ea4156dca',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    },
    {
      _id: '019a6184-83c9-7cc5-b931-3cee27ab0360',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    }
  ]
} => { request: '019a6184-8fe5-746e-8578-5f10962eaf33' }
[Requesting] Received request for path: /QuickCheckIns/delete
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  checkIn: '019a6184-82a2-7a3a-8ebd-d12ea4156dca',
  checkInId: '019a6184-82a2-7a3a-8ebd-d12ea4156dca',
  id: '019a6184-82a2-7a3a-8ebd-d12ea4156dca',
  path: '/QuickCheckIns/delete'
} => { request: '019a6184-9525-7b5b-9cb9-2ae985ce6ec6' }
QuickCheckIns.delete {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  checkIn: '019a6184-82a2-7a3a-8ebd-d12ea4156dca'
} => {}
Requesting.respond { request: '019a6184-9525-7b5b-9cb9-2ae985ce6ec6', success: true } => { request: '019a6184-9525-7b5b-9cb9-2ae985ce6ec6' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  metricId: '019a6183-a492-7706-be74-209901e33f1d',
  metric: '019a6183-a492-7706-be74-209901e33f1d',
  id: '019a6183-a492-7706-be74-209901e33f1d',
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6184-974c-737c-a282-90449bf83677' }
[Requesting] Received request for path: /MealLog/_getMealsByOwner
Requesting.respond {
  request: '019a6184-974c-737c-a282-90449bf83677',
  checkIns: [
    {
      _id: '019a6184-83c9-7cc5-b931-3cee27ab0360',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    }
  ]
} => { request: '019a6184-974c-737c-a282-90449bf83677' }
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  includeDeleted: false,
  path: '/MealLog/_getMealsByOwner'
} => { request: '019a6184-9880-7816-a6e2-323bcc4b524a' }
Requesting.respond {
  request: '019a6184-9880-7816-a6e2-323bcc4b524a',
  meals: Frames(1) [
    {
      _id: '019a6184-6339-7b98-9b70-ef3ec5a10ee3',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:30:00.000Z',
      items: [Array],
      notes: null,
      status: 'ACTIVE'
    }
  ]
} => { request: '019a6184-9880-7816-a6e2-323bcc4b524a' }
[Requesting] Received request for path: /QuickCheckIns/_listMetricsForOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  path: '/QuickCheckIns/_listMetricsForOwner'
} => { request: '019a6184-9a3c-72a6-a5aa-3c0ff4922ddc' }
Requesting.respond {
  request: '019a6184-9a3c-72a6-a5aa-3c0ff4922ddc',
  metrics: [
    {
      _id: '019a6183-a492-7706-be74-209901e33f1d',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      name: 'sleep (/10)'
    }
  ]
} => { request: '019a6184-9a3c-72a6-a5aa-3c0ff4922ddc' }
[Requesting] Received request for path: /QuickCheckIns/_listCheckInsByOwner
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  startDate: 1762056000000,
  endDate: 1762577999999,
  start: 1762056000000,
  end: 1762577999999,
  startAt: 1762056000000,
  endAt: 1762577999999,
  startTime: 1762056000000,
  endTime: 1762577999999,
  from: 1762056000000,
  to: 1762577999999,
  rangeStart: 1762056000000,
  rangeEnd: 1762577999999,
  startSeconds: 1762056000,
  endSeconds: 1762577999,
  path: '/QuickCheckIns/_listCheckInsByOwner'
} => { request: '019a6184-9ce0-7299-9ee9-fabaff25a398' }
Requesting.respond {
  request: '019a6184-9ce0-7299-9ee9-fabaff25a398',
  checkIns: [
    {
      _id: '019a6184-83c9-7cc5-b931-3cee27ab0360',
      owner: '019a6183-5511-7d21-aa85-39f1418186e6',
      at: '2025-11-08T03:31:04.000Z',
      metric: '019a6183-a492-7706-be74-209901e33f1d',
      value: 9
    }
  ]
} => { request: '019a6184-9ce0-7299-9ee9-fabaff25a398' }
[Requesting] Received request for path: /PersonalQA/_getUserFacts
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  requester: '019a6183-5511-7d21-aa85-39f1418186e6',
  path: '/PersonalQA/_getUserFacts'
} => { request: '019a6184-cfc8-7a65-af8e-f7bc644c0d5e' }
Requesting.respond { request: '019a6184-cfc8-7a65-af8e-f7bc644c0d5e', facts: [] } => { request: '019a6184-cfc8-7a65-af8e-f7bc644c0d5e' }
[Requesting] Received request for path: /PersonalQA/ingestFact
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  at: '2025-11-08T03:31:30.089Z',
  content: 'I like apples',
  source: 'insight',
  path: '/PersonalQA/ingestFact'
} => { request: '019a6184-e363-721f-9188-fb7316888c1d' }
PersonalQA.ingestFact {
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  at: '2025-11-08T03:31:30.089Z',
  content: 'I like apples',
  source: 'insight'
} => { fact: '019a6184-e428-7f49-8ad9-682b1cbc03b8' }
Requesting.respond {
  request: '019a6184-e363-721f-9188-fb7316888c1d',
  fact: '019a6184-e428-7f49-8ad9-682b1cbc03b8'
} => { request: '019a6184-e363-721f-9188-fb7316888c1d' }
[Requesting] Received request for path: /PersonalQA/askLLM
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  requester: '019a6183-5511-7d21-aa85-39f1418186e6',
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  user: '019a6183-5511-7d21-aa85-39f1418186e6',
  question: 'Conversation so far:\n' +
    'User: do I like apples\n' +
    '\n' +
    'User question: do I like apples',
  path: '/PersonalQA/askLLM'
} => { request: '019a6184-fc30-7ecc-bd68-aa8c3b31d897' }
PersonalQA.askLLM {
  requester: '019a6183-5511-7d21-aa85-39f1418186e6',
  question: 'Conversation so far:\n' +
    'User: do I like apples\n' +
    '\n' +
    'User question: do I like apples'
} => {
  qa: {
    _id: '019a6185-005f-7a62-998d-d1a46527e856',
    owner: '019a6183-5511-7d21-aa85-39f1418186e6',
    question: 'Conversation so far:\n' +
      'User: do I like apples\n' +
      '\n' +
      'User question: do I like apples',
    answer: 'Yes, you do like apples. This is based on information from November 8, 2025.',
    citedFacts: [ '019a6184-e428-7f49-8ad9-682b1cbc03b8' ],
    confidence: 0.9,
    at: '2025-11-08T03:31:37.695Z'
  }
}
Requesting.respond {
  request: '019a6184-fc30-7ecc-bd68-aa8c3b31d897',
  qa: {
    _id: '019a6185-005f-7a62-998d-d1a46527e856',
    owner: '019a6183-5511-7d21-aa85-39f1418186e6',
    question: 'Conversation so far:\n' +
      'User: do I like apples\n' +
      '\n' +
      'User question: do I like apples',
    answer: 'Yes, you do like apples. This is based on information from November 8, 2025.',
    citedFacts: [ '019a6184-e428-7f49-8ad9-682b1cbc03b8' ],
    confidence: 0.9,
    at: '2025-11-08T03:31:37.695Z'
  }
} => { request: '019a6184-fc30-7ecc-bd68-aa8c3b31d897' }
[Requesting] Received request for path: /PersonalQA/askLLM
Requesting.request {
  session: '019a6183-735d-77f3-a53f-4d617488a28a',
  requester: '019a6183-5511-7d21-aa85-39f1418186e6',
  owner: '019a6183-5511-7d21-aa85-39f1418186e6',
  user: '019a6183-5511-7d21-aa85-39f1418186e6',
  question: 'Conversation so far:\n' +
    'User: do I like apples\n' +
    'Assistant: Yes, you do like apples. This is based on information from November 8, 2025.\n' +
    'User: should I eat apples\n' +
    '\n' +
    'User question: should I eat apples',
  path: '/PersonalQA/askLLM'
} => { request: '019a6185-1ab1-7852-a8d1-323e2cf9c85e' }
PersonalQA.askLLM {
  requester: '019a6183-5511-7d21-aa85-39f1418186e6',
  question: 'Conversation so far:\n' +
    'User: do I like apples\n' +
    'Assistant: Yes, you do like apples. This is based on information from November 8, 2025.\n' +
    'User: should I eat apples\n' +
    '\n' +
    'User question: should I eat apples'
} => {
  qa: {
    _id: '019a6185-1e5d-7650-bc25-33c9ff0f2579',
    owner: '019a6183-5511-7d21-aa85-39f1418186e6',
    question: 'Conversation so far:\n' +
      'User: do I like apples\n' +
      'Assistant: Yes, you do like apples. This is based on information from November 8, 2025.\n' +
      'User: should I eat apples\n' +
      '\n' +
      'User question: should I eat apples',
    answer: "Given that you like apples, it's a good idea to eat them. Apples are a healthy and delicious snack.",
    citedFacts: [ '019a6184-e428-7f49-8ad9-682b1cbc03b8' ],
    confidence: 0.9,
    at: '2025-11-08T03:31:45.373Z'
  }
}
Requesting.respond {
  request: '019a6185-1ab1-7852-a8d1-323e2cf9c85e',
  qa: {
    _id: '019a6185-1e5d-7650-bc25-33c9ff0f2579',
    owner: '019a6183-5511-7d21-aa85-39f1418186e6',
    question: 'Conversation so far:\n' +
      'User: do I like apples\n' +
      'Assistant: Yes, you do like apples. This is based on information from November 8, 2025.\n' +
      'User: should I eat apples\n' +
      '\n' +
      'User question: should I eat apples',
    answer: "Given that you like apples, it's a good idea to eat them. Apples are a healthy and delicious snack.",
    citedFacts: [ '019a6184-e428-7f49-8ad9-682b1cbc03b8' ],
    confidence: 0.9,
    at: '2025-11-08T03:31:45.373Z'
  }
} => { request: '019a6185-1ab1-7852-a8d1-323e2cf9c85e' }
[Requesting] Received request for path: /logout
Requesting.request { session: '019a6183-735d-77f3-a53f-4d617488a28a', path: '/logout' } => { request: '019a6185-2f29-769e-97b8-8de1e7379265' }
Sessioning.delete { session: '019a6183-735d-77f3-a53f-4d617488a28a' } => {}
Requesting.respond {
  request: '019a6185-2f29-769e-97b8-8de1e7379265',
  status: 'logged_out'
} => { request: '019a6185-2f29-769e-97b8-8de1e7379265' }
