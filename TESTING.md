# Testing Guide

Este documento describe cómo ejecutar las pruebas en el proyecto de autenticación.

## Tipos de Pruebas

### 1. Pruebas Unitarias
Las pruebas unitarias están ubicadas junto a los archivos que prueban y siguen la convención `*.spec.ts`.

#### Ejecutar todas las pruebas unitarias:
```bash
npm test
```

#### Ejecutar pruebas unitarias en modo watch:
```bash
npm run test:watch
```

#### Ejecutar pruebas unitarias con cobertura:
```bash
npm run test:cov
```

#### Ejecutar pruebas unitarias en modo debug:
```bash
npm run test:debug
```

### 2. Pruebas End-to-End (E2E)
Las pruebas E2E están ubicadas en el directorio `test/` y siguen la convención `*.e2e-spec.ts`.

#### Ejecutar todas las pruebas E2E:
```bash
npm run test:e2e
```

## Estructura de Pruebas

### Pruebas Unitarias

#### Servicios
- `src/user/application/user.service.spec.ts` - Pruebas del UserService
- `src/auth/application/auth.service.spec.ts` - Pruebas del AuthService

#### Controladores
- `src/user/infrastructure/user.controller.spec.ts` - Pruebas del UserController

#### Repositorios
- `src/user/infrastructure/adapters/user.adapter.repository.spec.ts` - Pruebas del UserAdapterRepository
- `src/auth/infrastructure/adapters/auth.adapter.repository.spec.ts` - Pruebas del AuthAdapterRepository

#### Estrategias y Guards
- `src/auth/infrastructure/strategies/jwt.strategy.spec.ts` - Pruebas de la JWT Strategy
- `src/auth/infrastructure/guards/user-role.guard.spec.ts` - Pruebas del UserRoleGuard

#### Utilidades
- `src/common/utils/responses.util.spec.ts` - Pruebas de ResponsesUtil
- `src/common/utils/functions.util.spec.ts` - Pruebas de FunctionsUtil

### Pruebas E2E
- `test/user.e2e-spec.ts` - Pruebas E2E del módulo de usuarios

## Configuración de Pruebas

### Variables de Entorno para Pruebas
Las pruebas utilizan las siguientes variables de entorno:

```env
NODE_ENV=test
JWT_SECRET=test-secret-key
JWT_EXPIRATION=1h
COSMOS_DB_ENOINT=https://test-cosmos-db.documents.azure.com:443/
COSMOS_DB_KEY=test-key
COSMOS_DB_NAME=test-database
```

### Configuración de Jest
- **Pruebas Unitarias**: Configuradas en `package.json`
- **Pruebas E2E**: Configuradas en `test/jest-e2e.json`

## Cobertura de Pruebas

### Funcionalidades Cubiertas

#### UserService
- ✅ Creación de usuarios
- ✅ Login de usuarios
- ✅ Búsqueda de usuarios
- ✅ Actualización de usuarios
- ✅ Eliminación de usuarios
- ✅ Validación de credenciales
- ✅ Manejo de errores

#### AuthService
- ✅ Creación de autenticación
- ✅ Login de autenticación
- ✅ Búsqueda de autenticación
- ✅ Actualización de autenticación
- ✅ Eliminación de autenticación
- ✅ Creación de tokens
- ✅ Validación de tokens

#### UserController
- ✅ Endpoint POST /user (crear usuario)
- ✅ Endpoint POST /user/login (login)
- ✅ Endpoint GET /user/:id (buscar usuario)
- ✅ Endpoint PUT /user/:id (actualizar usuario)
- ✅ Endpoint DELETE /user/:id (eliminar usuario)

#### Repositorios
- ✅ Operaciones CRUD en UserAdapterRepository
- ✅ Operaciones CRUD en AuthAdapterRepository
- ✅ Manejo de errores de base de datos

#### Autenticación
- ✅ JWT Strategy
- ✅ UserRoleGuard
- ✅ Validación de roles

#### Utilidades
- ✅ ResponsesUtil
- ✅ FunctionsUtil

## Ejecutar Pruebas Específicas

### Ejecutar pruebas de un archivo específico:
```bash
npm test -- user.service.spec.ts
```

### Ejecutar pruebas con un patrón específico:
```bash
npm test -- --testNamePattern="should create a user"
```

### Ejecutar pruebas de un directorio específico:
```bash
npm test -- src/user/
```

## Debugging de Pruebas

### Usar console.log en pruebas:
```typescript
it('should create user', () => {
  console.log('Test data:', testData);
  // ... resto del test
});
```

### Usar debugger en pruebas:
```typescript
it('should create user', () => {
  debugger;
  // ... resto del test
});
```

## Mejores Prácticas

### 1. Nomenclatura de Pruebas
- Usar nombres descriptivos que expliquen qué se está probando
- Seguir el patrón: "should [expected behavior] when [condition]"

### 2. Organización de Pruebas
- Agrupar pruebas relacionadas en `describe` blocks
- Usar `beforeEach` y `afterEach` para setup y cleanup
- Limpiar mocks después de cada prueba

### 3. Mocks
- Mockear dependencias externas (base de datos, servicios externos)
- Usar mocks realistas que simulen el comportamiento esperado
- Verificar que los mocks fueron llamados correctamente

### 4. Assertions
- Usar assertions específicos y descriptivos
- Verificar tanto el resultado exitoso como los casos de error
- Probar edge cases y casos límite

## Troubleshooting

### Problemas Comunes

#### 1. Error de conexión a base de datos
- Verificar que las variables de entorno están configuradas
- Asegurar que la base de datos de prueba está disponible

#### 2. Timeout en pruebas E2E
- Aumentar el timeout en `test/jest-e2e.setup.ts`
- Verificar que la aplicación se inicia correctamente

#### 3. Errores de importación
- Verificar que las rutas de importación son correctas
- Asegurar que los archivos de configuración de Jest están actualizados

### Logs de Pruebas
Para ver logs detallados durante la ejecución de pruebas:
```bash
npm test -- --verbose
```

## Contribución

Al agregar nuevas funcionalidades, asegúrate de:

1. Escribir pruebas unitarias para la nueva funcionalidad
2. Actualizar las pruebas E2E si es necesario
3. Mantener la cobertura de código por encima del 80%
4. Documentar cualquier nueva utilidad de prueba

## Recursos Adicionales

- [Documentación de Jest](https://jestjs.io/docs/getting-started)
- [Documentación de NestJS Testing](https://docs.nestjs.com/fundamentals/testing)
- [Supertest Documentation](https://github.com/visionmedia/supertest) 