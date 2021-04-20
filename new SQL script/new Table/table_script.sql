create table COMPLAINT_STATUS
(
    statusName varchar(10),
    statusID   int not null
        constraint COMPLAINT_STATUS_pk
            primary key nonclustered
)
go

create table FEEDBACK
(
    complaintID  int not null
        constraint FEEDBACK_pk
            primary key nonclustered,
    satisfaction int,
    description  varchar(1000)
)
go

create table ROLE
(
    roleID   int not null
        constraint ROLE_pk
            primary key nonclustered,
    roleName varchar(25)
)
go

create unique index ROLE_roleID_uindex
    on ROLE (roleID)
go

create table USERS
(
    userID        int         not null
        constraint USERS_pk
            primary key nonclustered,
    userEmail     varchar(50) not null,
    password      varchar(20),
    firstName     varchar(40),
    lastName      varchar(40),
    contactNumber varchar(20),
    activeStatus  bit,
    lastLogin     datetime,
    createdBy     varchar(50),
    createdAt     datetime,
    modifiedBy    varchar(50),
    modifiedAt    datetime
)
go

create table PRODUCT
(
    productID            int not null
        constraint PRODUCT_pk
            primary key nonclustered,
    productName          varchar(40),
    category             varchar(20),
    customerID           int
        constraint PRODUCT_USERS_userID_fk_2
            references USERS,
    projectManagerID     int
        constraint PRODUCT_USERS_userID_fk_3
            references USERS,
    accountCoordinatorID int
        constraint PRODUCT_USERS_userID_fk
            references USERS,
    createdAt            datetime,
    createdBy            int,
    modifiedAt           datetime,
    modifiedBy           int
)
go

create table ALLOCATION
(
    developerID int not null
        constraint ALLOCATION_USERS_userID_fk
            references USERS,
    productID   int not null
        constraint ALLOCATION_PRODUCT_productID_fk
            references PRODUCT,
    constraint ALLOCATION_pk
        primary key nonclustered (developerID, productID)
)
go

create table COMPLAINT
(
    complaintID       int not null,
    subComplaintID    int not null,
    description       varchar(5000),
    status            int
        constraint COMPLAINT_COMPLAINT_STATUS_statusID_fk
            references COMPLAINT_STATUS,
    submittedDate     datetime,
    lastDateOfPending datetime,
    wipStartDate      datetime,
    finishedDate      datetime,
    productID         int
        constraint COMPLAINT_PRODUCT_productID_fk
            references PRODUCT
            on update cascade,
    constraint COMPLAINT_pk
        primary key nonclustered (complaintID, subComplaintID)
)
go

create table COMMENT
(
    complaintID     int not null,
    commentID       int not null,
    isImage         bit,
    textOrImageName varchar(max),
    senderID        int
        constraint COMMENT_USERS_userID_fk
            references USERS,
    submittedTime   datetime,
    subComplaintID  int not null,
    constraint COMMENT_pk
        primary key nonclustered (complaintID, commentID),
    constraint COMMENT_COMPLAINT_complaintID_subComplaintID_fk
        foreign key (complaintID, subComplaintID) references COMPLAINT
)
go

create table COMPLAINT_ATTACHMENT_DETAILS
(
    complaintID    int not null,
    subComplaintID int not null,
    imageIndex     int not null,
    imageName      varchar(max),
    constraint COMPLAINT_ATTACHMENT_DETAILS_pk
        primary key nonclustered (complaintID, subComplaintID, imageIndex),
    constraint COMPLAINT_ATTACHMENT_DETAILS_COMPLAINT_complaintID_subComplaintID_fk
        foreign key (complaintID, subComplaintID) references COMPLAINT
            on update cascade on delete cascade
)
go

create table TASK
(
    taskID               varchar(10) not null
        constraint TASK_pk
            primary key nonclustered,
    complaintID          int,
    subComplaintID       int,
    assignDate           datetime,
    deadline             datetime,
    completed            bit,
    accountCoordinatorID int
        constraint TASK_USERS_userID_fk
            references USERS,
    developerID          int
        constraint TASK_USERS_userID_fk_2
            references USERS,
    constraint TASK_COMPLAINT_complainID_subComplaintID_fk
        foreign key (complaintID, subComplaintID) references COMPLAINT
)
go

create unique index USERS_userEmail_uindex
    on USERS (userEmail)
go

create table USER_ROLE
(
    userID    int not null,
    roleID    int not null
        constraint USER_ROLE_ROLE_roleID_fk
            references ROLE,
    [default] bit not null,
    constraint USER_ROLE_pk
        primary key nonclustered (roleID, userID)
)
go
