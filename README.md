# Nest.js Backend Server for Keylog

## 🚀 개요

NestJS와 TypeORM을 사용한 블로그 플랫폼의 백엔드 서버입니다. 레이어드 아키텍처를 적용하여 모듈화된 구조로 설계되었습니다.

## 📋 주요 기능

### Post 모듈

- 게시글 CRUD 작업
- 페이지네이션을 지원하는 게시글 목록 조회
- 검색 기능 (제목, 내용)
- 임시 저장 게시글 관리
- 최근 게시글 조회
- 인기 게시글 조회 (좋아요 기반)
- 해시태그 필터링

## 🛠 기술 스택

- **Framework**: NestJS
- **Database**: MySQL
- **ORM**: TypeORM
- **Validation**: class-validator, class-transformer
- **Testing**: Jest
- **Language**: TypeScript

## 📁 프로젝트 구조

```
src/
├── post/
│   ├── entities/
│   │   └── post.entity.ts       # Post 엔티티
│   ├── dto/
│   │   ├── create-post.dto.ts   # 게시글 생성 DTO
│   │   ├── update-post.dto.ts   # 게시글 수정 DTO
│   │   └── post-list-query.dto.ts # 목록 조회 쿼리 DTO
│   ├── post.controller.ts       # REST API 컨트롤러
│   ├── post.service.ts          # 비즈니스 로직
│   ├── post.repository.ts       # 데이터 액세스 레이어
│   ├── post.module.ts           # 모듈 설정
│   └── post.service.spec.ts     # 단위 테스트
├── app.module.ts                # 루트 모듈
└── main.ts                      # 애플리케이션 진입점
```

## ⚙️ 설정

### 1. 패키지 설치

```bash
pnpm install
```

### 2. 환경변수 설정

`.env` 파일을 생성하고 다음 내용을 설정하세요:

```env
# Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_USERNAME=root
DB_PASSWORD=your_password
DB_DATABASE=keylog

# Application Configuration
NODE_ENV=development
PORT=3000
```

### 3. 데이터베이스 설정

MySQL 데이터베이스를 생성하고 연결 정보를 환경변수에 설정하세요.

## 🏃‍♂️ 실행

### 개발 모드

```bash
pnpm start:dev
```

### 프로덕션 모드

```bash
pnpm build
pnpm start:prod
```

## 🧪 테스트

### 단위 테스트

```bash
pnpm test
```

### E2E 테스트

```bash
pnpm test:e2e
```

### 테스트 커버리지

```bash
pnpm test:cov
```

## 📡 API 엔드포인트

### Posts

- `GET /posts` - 게시글 목록 조회 (페이지네이션, 검색, 필터링)
- `GET /posts/:id` - 특정 게시글 조회
- `POST /posts` - 게시글 생성
- `PUT /posts/:id` - 게시글 수정
- `DELETE /posts/:id` - 게시글 삭제
- `GET /posts/recent/:rgsrId` - 최근 게시글 조회
- `GET /posts/popular/:rgsrId` - 인기 게시글 조회
- `DELETE /posts/user/:rgsrId` - 사용자의 모든 게시글 삭제
- `DELETE /posts/temp/:postOriginId` - 임시 게시글 삭제
- `GET /posts/temp/last/:postId` - 마지막 임시 게시글 조회
- `GET /posts/admin/test` - 서비스 상태 확인 (스모크 테스트)

### 쿼리 파라미터 예시

```
GET /posts?perPage=10&currPageNum=1&searchWord=검색어&tempYn=N&tagId=1&id=user123
```

## 🏗 아키텍처 특징

### 레이어드 아키텍처

- **Controller**: HTTP 요청/응답 처리
- **Service**: 비즈니스 로직
- **Repository**: 데이터 액세스
- **Entity**: 데이터 모델

### 설계 원칙

- 단일 책임 원칙 (SRP)
- 의존성 주입 (DI)
- 모듈화된 구조
- DTO를 통한 데이터 검증
- TypeScript 타입 안전성

## 🔧 개발 가이드라인

- 모든 함수와 변수에 타입 선언
- camelCase 네이밍 컨벤션
- 단수형 폴더명 사용 (예: post, user)
- JSDoc을 통한 문서화
- 단위 테스트 작성 필수
- E2E 테스트를 통한 API 검증

## 📄 라이선스

이 프로젝트는 개인 프로젝트입니다.
