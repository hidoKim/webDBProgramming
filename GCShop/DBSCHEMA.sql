/*   PERSON TABLE SCHEMA */  
CREATE TABLE person (
   loginid varchar(10) NOT NULL,
   password varchar(20) NOT NULL,
   name  varchar(20) NOT NULL,
   mf varchar(2) NOT NULL, 
   address varchar(100),
   tel varchar(13), 
   birth varchar(8) NOT NULL,
   class varchar(3) NOT NULL, 
   PRIMARY KEY (loginid)
); 

insert into person values('C','C', '고객1','f', '서울', '000-111-2222','20000505','CST'); 
insert into person values('C2','C', '고객2', 'm', '부산', '010-2587-7896','20000101','CST'); 
insert into person values('CEO','CEO', '경영진', 'f', '대구', '010-9876-5432','19700908','CEO'); 
insert into person values('M','M', '관리자', 'm', '서울', '010-1234-5678','19800506','MNG'); 

SELECT * FROM webdb2025.person;

/*  CODE TABLE SCHEMA */  
CREATE TABLE code (
   main_id varchar(4) NOT NULL,
   sub_id varchar(4) NOT NULL,
   main_name  varchar(20) NOT NULL,
   sub_name varchar(100),
   start varchar(8) NOT NULL,
   end varchar(8) NOT NULL,
   PRIMARY KEY (main_id, sub_id, start)
); 
insert into code 
values('0000','0000','여성 의류', '상의', '20240101','20261231');
insert into code 
values('0000','0001','여성 의류', '아우터', '20240101','20261231');
insert into code 
values('1000','0001','식품', '신선식품', '20240101','99999999');
insert into code 
values('2000','0001','가전', '주방 가전', '20240101','99999999');
insert into code 
values('3000','0001','화장품', '여성', '20240101','99999999');

select * from code;
delete from code;
drop table code;


/*  PRODUCT TABLE SCHEMA */
CREATE TABLE product (
   main_id varchar(4) NOT NULL,
   sub_id varchar(4) NOT NULL,
   prod_id int NOT NULL AUTO_INCREMENT,
   name  varchar(300) NOT NULL,
   price int NOT NULL,
   stock int NOT NULL,
   brand varchar(50) NOT NULL,
   supplier varchar(50) NOT NULL,
   image varchar(50),     
   PRIMARY KEY (prod_id)
); 
drop table product; 
delete from product;
select * from product;

/*  BOARDTYPE TABLE SCHEMA */
CREATE TABLE boardtype (
   type_id int NOT NULL AUTO_INCREMENT,
   title varchar(200) NOT NULL,
   description varchar(400),
   write_YN varchar(1) NOT NULL,
   re_YN varchar(1) NOT NULL,
   numPerPage int, 
   PRIMARY KEY (type_id)
);  
drop table boardtype;
delete from boardtype;
select * from boardtype;

INSERT INTO boardtype (title, description, write_YN, re_YN, numPerPage)
values('Q &amp; A', '질의 응답 전용 게시판', 'N', 'N', 2);
INSERT INTO boardtype (title, description, write_YN, re_YN, numPerPage)
values('공지사항', '쇼핑몰 관련 공지사항 개재', 'N', 'N', 2);
INSERT INTO boardtype (title, description, write_YN, re_YN, numPerPage)
values('상품 후기', '고객들의 상품 후기 관련', 'Y', 'N', 2);
INSERT INTO boardtype (title, description, write_YN, re_YN, numPerPage)
values('고객 불만', '고객 불만에 관한 글', 'Y', 'N', 3);
INSERT INTO boardtype (title, description, write_YN, re_YN, numPerPage)
values('기말고사 관련', '기말고사 관련 공지사항', 'N', 'N', 2);


/*  BOARD TABLE SCHEMA */
CREATE TABLE board (
   type_id int,
   board_id int NOT NULL AUTO_INCREMENT,
   p_id int,
   loginid varchar(10) NOT NULL,
   password varchar(20),
   title varchar(200) NOT NULL,
   date varchar(50),
   content text,
   PRIMARY KEY (board_id)
); 

drop table board;
delete from board;
select * from board;

/*  PURCHASE TABLE SCHEMA */
CREATE TABLE purchase (
   purchase_id int NOT NULL AUTO_INCREMENT,
   loginid varchar(10) NOT NULL,
   prod_id int NOT NULL,
   date varchar(30) NOT NULL,
   price int, 
   point int, 
   qty int, 
   total int, 
   payYN varchar(1) NOT NULL DEFAULT 'N',
   cancel varchar(1) NOT NULL DEFAULT 'N', 
   refund varchar(1) NOT NULL DEFAULT 'N', 
   PRIMARY KEY (purchase_id)
);  

drop table purchase;
delete from purchase;
select * from purchase;

/*  CART TABLE SCHEMA */
CREATE TABLE cart (
   cart_id int NOT NULL AUTO_INCREMENT,
   loginid varchar(10) NOT NULL,
   prod_id int NOT NULL,
   date varchar(30) NOT NULL,
   PRIMARY KEY (cart_id)
);  

select * from cart;
delete from cart;

/* 일단 여기까지 했음-5월15일*/

/*  webdb2024에 있는 TABLE 목록을 보는 SQL 문장 */
show tables;
SELECT *
FROM INFORMATION_SCHEMA.TABLES
where table_schema = 'webdb2024';

show columns from tbl;

 /*  webdb2024에 있는 TABLE을 구성하는 COLUMN들의 목록을 보는 SQL 문장 */
SELECT  *
FROM information_schema.columns
WHERE table_schema = 'webdb2024' and  table_name='cart' ;

 /*  TABLE 생성할 때 각 CULUMN의 COMMENT 포함하는 법 */
CREATE TABLE MOA_QA
(
	SEQ_NO				BIGINT auto_increment NOT NULL KEY COMMENT '일련번호',
	TITLE				VARCHAR(300) NOT NULL COMMENT 'QA 제목',
	SORT				VARCHAR(20) NOT NULL COMMENT 'QA 형식(객관식/OX/단답형)',
	ANSWER				VARCHAR(300) NOT NULL COMMENT '답변',
	ADD_CONTENTS		TEXT COMMENT '추가내용',
	HINT				VARCHAR(300) COMMENT '힌트',
	OPENED_HINT_YN		VARCHAR(1) COMMENT '힌트 오픈 여부',
	EXPLANATION			TEXT COMMENT '설명',
	LINK_URL   			VARCHAR(300) COMMENT '참고 링크 url',
	IMAGE_URL      		VARCHAR(300) COMMENT '이미지 url',
	OPENED_COUNT		BIGINT COMMENT 'QA 오픈 수',
	ACTION_COUNT		BIGINT COMMENT 'QA에 응답한 수',
	CORRECT_COUNT		BIGINT COMMENT 'QA 정답수',
	CREATE_USER			VARCHAR(20) COMMENT '등록자',
	CREATE_DATE			DATE COMMENT '등록일',
	UPDATE_USER			VARCHAR(20) COMMENT '수정자',
	UPDATE_DATE			DATE COMMENT '수정일'
) COMMENT 'QA 테이블';
 