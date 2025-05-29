// file: init-builder.ts
// import your custom component
import TestComponent from './components/Test.vue'

export const registeredComponents = [
  {
    component: TestComponent,
    name: 'Hello Test',
    inputs: [
      {
        name: 'text',
        type: 'string',
        defaultValue: 'World',
      },
    ],
  },
]