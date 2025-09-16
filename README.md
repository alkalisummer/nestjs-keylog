# NestJS Keylog Backend

## 🚀 개요

NestJS(Fastify)와 TypeORM을 사용한 Keyolog 백엔드 서버입니다. 모듈화된 아키텍처를 적용하여 확장 가능하고 유지보수가 용이한 구조로 설계하였습니다.

## 📋 주요 기능

### 🔐 User 모듈

- 사용자 회원가입 및 로그인
- JWT 토큰 기반 인증
- 사용자 정보 관리
- 이메일 인증 코드 시스템

### 📝 Post 모듈

- 게시글 CRUD 작업
- 페이지네이션을 지원하는 게시글 목록 조회
- 검색 기능 (제목, 내용)
- 임시 저장 게시글 관리
- 최근 게시글 조회
- 인기 게시글 조회 (좋아요 기반)

### 💬 Comment 모듈

- 댓글 작성, 수정, 삭제
- 대댓글 기능
- 댓글 목록 조회

### 🏷️ Hashtag 모듈

- 해시태그 생성 및 관리
- 해시태그 검색 및 조회

### 🔗 PostTag 모듈

- 게시글과 해시태그 연결 관리
- 해시태그별 게시글 필터링

### ❤️ Like 모듈

- 게시글 좋아요/좋아요 취소
- 좋아요 수 집계

## 🛠 기술 스택

- **Framework**: NestJS 11.x
- **Database**: MySQL
- **ORM**: TypeORM
- **Authentication**: JWT, bcrypt
- **Validation**: class-validator, class-transformer
- **Configuration**: @nestjs/config
- **Language**: TypeScript
- **Package Manager**: pnpm

## 📁 아키텍쳐

#### Backend (Nest.js)

```
src/
├── app.module.ts                # 루트 모듈
├── main.ts                      # 애플리케이션 진입점
├── core/                        # 핵심 모듈 (필터, 가드, 인터셉터)
├── modules/                     # 비즈니스 모듈들
│   ├── user/                    # 사용자 관리
│   │   ├── entities/
│   │   │   ├── user.entity.ts
│   │   │   ├── user-token.entity.ts
│   │   │   └── verify-code.entity.ts
│   │   ├── dto/
│   │   │   ├── create-user.dto.ts
│   │   │   ├── login-user.dto.ts
│   │   │   ├── update-user.dto.ts
│   │   │   ├── user-token.dto.ts
│   │   │   └── verify-code.dto.ts
│   │   ├── user.controller.ts
│   │   ├── user.service.ts
│   │   ├── user.repository.ts
│   │   └── user.module.ts
│   ├── post/                    # 게시글 관리
│   │   ├── entities/
│   │   │   └── post.entity.ts
│   │   ├── dto/
│   │   │   ├── create-post.dto.ts
│   │   │   ├── update-post.dto.ts
│   │   │   └── post-list-query.dto.ts
│   │   ├── post.controller.ts
│   │   ├── post.service.ts
│   │   ├── post.repository.ts
│   │   └── post.module.ts
│   ├── comment/                 # 댓글 관리
│   │   ├── entities/
│   │   │   └── comment.entity.ts
│   │   ├── dto/
│   │   │   ├── create-comment.dto.ts
│   │   │   ├── create-reply.dto.ts
│   │   │   ├── update-comment.dto.ts
│   │   │   └── comment-list-query.dto.ts
│   │   ├── comment.controller.ts
│   │   ├── comment.service.ts
│   │   ├── comment.repository.ts
│   │   └── comment.module.ts
│   ├── hashtag/                 # 해시태그 관리
│   │   ├── entities/
│   │   │   └── hashtag.entity.ts
│   │   ├── dto/
│   │   │   ├── create-hashtag.dto.ts
│   │   │   └── hashtag-query.dto.ts
│   │   ├── hashtag.controller.ts
│   │   ├── hashtag.service.ts
│   │   ├── hashtag.repository.ts
│   │   └── hashtag.module.ts
│   ├── post-tag/                # 게시글-태그 연결
│   │   ├── entities/
│   │   │   └── post-tag.entity.ts
│   │   ├── dto/
│   │   │   ├── create-post-tag.dto.ts
│   │   │   ├── delete-post-tag.dto.ts
│   │   │   └── post-tag-query.dto.ts
│   │   ├── post-tag.controller.ts
│   │   ├── post-tag.service.ts
│   │   ├── post-tag.repository.ts
│   │   └── post-tag.module.ts
│   └── like/                    # 좋아요 관리
│       ├── entities/
│       │   └── like.entity.ts
│       ├── dto/
│       │   ├── create-like.dto.ts
│       │   ├── delete-like.dto.ts
│       │   └── like-query.dto.ts
│       ├── like.controller.ts
│       ├── like.service.ts
│       ├── like.repository.ts
│       └── like.module.ts
└── shared/                      # 공유 유틸리티
    └── utils/
        ├── bcrypt.util.ts
        ├── date.util.ts
        └── index.ts
```
