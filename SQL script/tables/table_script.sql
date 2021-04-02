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
    userEmail     varchar(50) not null
        constraint User_pk
            primary key nonclustered,
    password      varchar(20) not null,
    firstName     varchar(40),
    lastName      varchar(40),
    contactNumber varchar(20),
    activeStatus  varchar(5),
    lastLogin     datetime,
    createdBy     varchar(50),
    createdAt     datetime,
    modifiedBy    varchar(50),
    modifiedAt    datetime
)
go

create table ACCOUNT_COORDINATOR
(
    accountCoordinatorEmail varchar(50) not null
        constraint ACCOUNT_COORDINATOR_pk
            primary key nonclustered
        constraint ACCOUNT_COORDINATOR_USER_userEmail_fk
            references USERS,
    accountCoordinatorName  varchar(40)
)
go

create table ADMIN
(
    adminEmail varchar(50) not null
        constraint ADMIN_pk
            primary key nonclustered
        constraint ADMIN_USERS_userEmail_fk
            references USERS
)
go

create table CEO
(
    ceoEmail varchar(50) not null
        constraint CEO_pk
            primary key nonclustered
        constraint CEO_USERS_userEmail_fk
            references USERS
)
go

create table CUSTOMER
(
    customerEmail  varchar(50) not null
        constraint CUSTOMER_pk
            primary key nonclustered
        constraint CUSTOMER_USER_userEmail_fk
            references USERS,
    companyName    varchar(20),
    companyAddress varchar(50)
)
go

create table DEVELOPER
(
    developerEmail varchar(50) not null
        constraint DEVELOPER_pk
            primary key nonclustered
        constraint DEVELOPER_USER_userEmail_fk
            references USERS,
    developerLevel varchar(20)
)
go

create table PROJECT_MANAGER
(
    projectManagerEmail varchar(50) not null
        constraint PROJECT_MANAGER_pk
            primary key nonclustered
        constraint PROJECT_MANAGER_USER_userEmail_fk
            references USERS,
    projectManagerName  varchar(40)
)
go

create table PRODUCT
(
    productID               int not null
        constraint PRODUCT_pk
            primary key nonclustered,
    productName             varchar(40),
    category                varchar(20),
    customerEmail           varchar(50)
        constraint PRODUCT_CUSTOMER_customerEmail_fk
            references CUSTOMER,
    projectManagerEmail     varchar(50)
        constraint PRODUCT_PROJECT_MANAGER_projectManagerEmail_fk
            references PROJECT_MANAGER,
    accountCoordinatorEmail varchar(50)
        constraint PRODUCT_ACCOUNT_COORDINATOR_accountCoordinatorEmail_fk
            references ACCOUNT_COORDINATOR,
    createdAt               datetime,
    createdBy               varchar(50),
    modifiedAt              datetime,
    modifiedBy              varchar(50)
)
go

create table ALLOCATION
(
    productID      int         not null
        constraint ALLOCATION_PRODUCT_productID_fk
            references PRODUCT,
    developerEmail varchar(50) not null
        constraint ALLOCATION_DEVELOPER_developerEmail_fk
            references DEVELOPER,
    constraint ALLOCATION_pk
        primary key nonclustered (developerEmail, productID)
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
            references PRODUCT,
    constraint COMPLAINT_pk
        primary key nonclustered (complaintID, subComplaintID)
)
go

create table TASK
(
    taskID                  varchar(10) not null
        constraint TASK_pk
            primary key nonclustered,
    complaintID             int,
    subComplaintID          int,
    assignDate              datetime,
    deadline                datetime,
    completed               bit,
    accountCoordinatorEmail varchar(50)
        constraint TASK_ACCOUNT_COORDINATOR_accountCoordinatorEmail_fk
            references ACCOUNT_COORDINATOR,
    developerEmail          varchar(50)
        constraint TASK_DEVELOPER_developerEmail_fk
            references DEVELOPER,
    constraint TASK_COMPLAINT_complainID_subComplaintID_fk
        foreign key (complaintID, subComplaintID) references COMPLAINT
)
go

create table USER_ROLE
(
    userEmail varchar(50) not null
        constraint ROLE_USER_userEmail_fk
            references USERS,
    roleID    int         not null
        constraint USER_ROLE_ROLE_roleID_fk
            references ROLE,
    [default] bit         not null,
    constraint USER_ROLE_pk
        primary key nonclustered (userEmail, roleID)
)
go

create TRIGGER deleteUser
    ON USER_ROLE
    after delete
    as
BEGIN
    DECLARE @userEmail varchar(50)

    SELECT @userEmail = deleted.userEmail
    from deleted

    if ((select roleID from deleted where deleted.userEmail = @userEmail) = 0)
        BEGIN
            DELETE FROM CUSTOMER where (customerEmail = @userEmail)
        END
    if ((select roleID from deleted where deleted.userEmail = @userEmail) = 1)
        BEGIN
            DELETE FROM ACCOUNT_COORDINATOR where (accountCoordinatorEmail = @userEmail)
        END
    if ((select roleID from deleted where deleted.userEmail = @userEmail) = 2)
        BEGIN
            DELETE FROM DEVELOPER where (developerEmail = @userEmail)
        END
    if ((select roleID from deleted where deleted.userEmail = @userEmail) = 3)
        BEGIN
            DELETE FROM PROJECT_MANAGER where (projectManagerEmail = @userEmail)
        END
    if ((select roleID from deleted where deleted.userEmail = @userEmail) = 4)
        BEGIN
            DELETE FROM CEO where (ceoEmail = @userEmail)
        END
    if ((select roleID from deleted where deleted.userEmail = @userEmail) = 5)
        BEGIN
            DELETE FROM ADMIN where (adminEmail = @userEmail)
        END
END
go

create TRIGGER insertNewUser
    ON USER_ROLE
    after insert
    as
BEGIN
    DECLARE @userEmail varchar(50)

    SELECT @userEmail = inserted.userEmail
    from inserted

    if ((select roleID from inserted where inserted.userEmail = @userEmail) = 0)
        BEGIN
            INSERT INTO CUSTOMER values (@userEmail, null, null)
        END
    if ((select roleID from inserted where inserted.userEmail = @userEmail) = 1)
        BEGIN
            INSERT INTO ACCOUNT_COORDINATOR values (@userEmail, null)
        END
    if ((select roleID from inserted where inserted.userEmail = @userEmail) = 2)
        BEGIN
            INSERT INTO DEVELOPER values (@userEmail, null)
        END
    if ((select roleID from inserted where inserted.userEmail = @userEmail) = 3)
        BEGIN
            INSERT INTO PROJECT_MANAGER values (@userEmail, null)
        END
    if ((select roleID from inserted where inserted.userEmail = @userEmail) = 4)
        BEGIN
            INSERT INTO CEO values (@userEmail)
        END
    if ((select roleID from inserted where inserted.userEmail = @userEmail) = 5)
        BEGIN
            INSERT INTO ADMIN values (@userEmail)
        END
END
go

