CREATE function SelectRole(@role_input varchar)
    Returns int
AS
BEGIN

    if (@role_input = 'Admin')
        begin
            return 5
        end
    if (@role_input = 'Customer')
        begin
            return 0
        end
    if (@role_input = 'Account Coordinator')
        begin
            return 1
        end
    if (@role_input = 'Developer')
        begin
            return 2
        end
    if (@role_input = 'Project Manager')
        begin
            return 3
        end
    if (@role_input = 'CEO')
        begin
            return 4
        end
    return -1
END
go

CREATE PROCEDURE createFeedback @_complaintID int,
                                @_feedback varchar(5000),
                                @_ratedValue int
AS
    BEGIN TRANSACTION

INSERT INTO FEEDBACK
VALUES (@_complaintID,
        @_ratedValue,
        @_feedback)
    IF @@ROWCOUNT = 0 GOTO errorHandler;

UPDATE COMPLAINT
SET status = 3
where complaintID = @_complaintID
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE procedure deleteSelectedProduct @_productID INT
as
    if exists(select 1
              from PRODUCT
              where productID = @_productID)
        begin
            DELETE FROM PRODUCT WHERE productID = @_productID;
        end
    else
        begin
            return -1;
        end
go

CREATE procedure deleteSelectedUser @_username VARCHAR(50)
as
    if exists(select 1
              from USERS
              where userEmail = @_username)
        begin
            DECLARE cursor_email CURSOR FOR SELECT userEmail, roleID FROM USER_ROLE WHERE userEmail = @_username

            declare @username varchar(50), @roleID int

            OPEN cursor_email
            fetch next from cursor_email into @username, @roleID

            while @@fetch_status = 0
                begin
                    delete from USER_ROLE where userEmail = @username AND roleID = @roleID
                    fetch next from cursor_email into @username, @roleID
                end

            DELETE FROM USERS WHERE userEmail = @username;
        end
    else
        begin
            return -1;
        end
go

CREATE procedure getCustomerComplaintsByStatusID @_customerEmail VARCHAR(50),
                                                 @_reqComplaintsStatus int
as
    if exists(select 1
              from COMPLAINT c)
        begin
            if (@_reqComplaintsStatus = -1)
                BEGIN
                    select *
                    from COMPLAINT C
                             JOIN PRODUCT P ON C.productID = P.productID
                    where C.subComplaintID != 0
                      and P.customerEmail = @_customerEmail
                    select *
                    from COMPLAINT C
                             JOIN PRODUCT P ON C.productID = P.productID
                    where C.subComplaintID = 0
                      and P.customerEmail = @_customerEmail
                    RETURN 0;
                END
            else
                if (@_reqComplaintsStatus = 0)
                    BEGIN
                        select *
                        from COMPLAINT C
                                 JOIN PRODUCT P ON C.productID = P.productID
                        where C.subComplaintID != 0
                          and P.customerEmail = @_customerEmail
                          and C.status = 0
                        select *
                        from COMPLAINT C
                                 JOIN PRODUCT P ON C.productID = P.productID
                        where C.subComplaintID = 0
                          and P.customerEmail = @_customerEmail
                          and C.status = 0
                        RETURN 0;
                    END
                else
                    if (@_reqComplaintsStatus = 1)
                        BEGIN
                            select *
                            from COMPLAINT C
                                     JOIN PRODUCT P ON C.productID = P.productID
                            where C.subComplaintID != 0
                              and P.customerEmail = @_customerEmail
                              and C.status = 1
                            select *
                            from COMPLAINT C
                                     JOIN PRODUCT P ON C.productID = P.productID
                            where C.subComplaintID = 0
                              and P.customerEmail = @_customerEmail
                              and C.status = 1
                            RETURN 0;
                        END
                    else
                        if (@_reqComplaintsStatus = 2)
                            BEGIN
                                select *
                                from COMPLAINT C
                                         JOIN PRODUCT P ON C.productID = P.productID
                                where C.subComplaintID != 0
                                  and P.customerEmail = @_customerEmail
                                  and C.status = 2
                                select *
                                from COMPLAINT C
                                         JOIN PRODUCT P ON C.productID = P.productID
                                where C.subComplaintID = 0
                                  and P.customerEmail = @_customerEmail
                                  and C.status = 2
                                RETURN 0;
                            END
                        else
                            if (@_reqComplaintsStatus = 3)
                                BEGIN
                                    select *
                                    from COMPLAINT C
                                             JOIN PRODUCT P ON C.productID = P.productID
                                    where C.subComplaintID != 0
                                      and P.customerEmail = @_customerEmail
                                      and C.status = 3
                                    select *
                                    from COMPLAINT C
                                             JOIN PRODUCT P ON C.productID = P.productID
                                    where C.subComplaintID = 0
                                      and P.customerEmail = @_customerEmail
                                      and C.status = 3
                                    RETURN 0;
                                END
        end
    else
        begin
            GOTO errorHandler;
        end
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE procedure getSelectedComplaintDetails(@_complaintID int,
                                             @_subComplaintID int)
as
    if exists(select 1
              from COMPLAINT
              where complaintID = @_complaintID
                and subComplaintID = @_subComplaintID)
        begin
            select * from COMPLAINT where complaintID = @_complaintID and subComplaintID = @_subComplaintID
            select statusName
            from COMPLAINT_STATUS C_S
                     JOIN COMPLAINT C on C_S.statusID = C.status
            where c.complaintID = @_complaintID
              and c.subComplaintID = @_subComplaintID
            select productName
            from PRODUCT P
                     JOIN COMPLAINT C2 on P.productID = C2.productID
            where C2.complaintID = @_complaintID
              and C2.subComplaintID = @_subComplaintID
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P2 on USR.userEmail = P2.projectManagerEmail
            where P2.productID = (
                select P.productID
                from PRODUCT P
                         JOIN COMPLAINT C2 on P.productID = C2.productID
                where C2.complaintID = @_complaintID
                  and C2.subComplaintID = @_subComplaintID)
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P2 on USR.userEmail = P2.accountCoordinatorEmail
            where P2.productID = (
                select P.productID
                from PRODUCT P
                         JOIN COMPLAINT C2 on P.productID = C2.productID
                where C2.complaintID = @_complaintID
                  and C2.subComplaintID = @_subComplaintID)

            return 0;
        end
    else
        begin
            GOTO errorHandler;
        end
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1
go

CREATE procedure getSelectedProductDetails(@_productID int)
as
    if exists(select 1
              from PRODUCT
              where productID = @_productID)
        begin
            select * from PRODUCT where productID = @_productID
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P1 on USR.userEmail = P1.customerEmail
            where P1.productID = @_productID
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P2 on USR.userEmail = P2.projectManagerEmail
            where P2.productID = @_productID
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P3 on USR.userEmail = P3.accountCoordinatorEmail
            where P3.productID = @_productID

            return 0;
        end
    else
        begin
            GOTO errorHandler;
        end
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1
go

CREATE procedure getSelectedUserDetails @_username VARCHAR(50)
as
    if exists(select 1
              from USERS
              where userEmail = @_username) and exists(select 1
                                                       from USER_ROLE ur
                                                       where ur.userEmail = @_username
                                                         and ur.[default] = 'true')
        begin
            select * from USERS where userEmail = @_username
            select ur.roleID from USER_ROLE ur where ur.userEmail = @_username;
            select ur.roleID from USER_ROLE ur where ur.userEmail = @_username and ur.[default] = 'true';
            return 0;
        end
    else
        begin
            GOTO errorHandler;
        end
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE procedure getSubComplaintsOfSelectedComplain @_complainId VARCHAR(10)
as
    if exists(select 1
              from COMPLAINT c
              where c.complainID = @_complainId
                and c.subComplaintID != 0)
        begin
            select * from COMPLAINT where subComplaintID != 0 and complainID = @_complainId
            RETURN 0;
        end
    else
        begin
            --             GOTO errorHandler;
            RETURN 1;
        end
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE PROCEDURE lodgeComplaint @_customerEmail varchar(50),
                                @_productID int,
                                @_description varchar(5000)
AS
    BEGIN TRANSACTION

INSERT INTO COMPLAINT
VALUES ((SELECT MAX(complaintID) from COMPLAINT) + 1,
        0,
        @_description,
        0,
        GETDATE(),
        (SELECT DATEADD(day, 2, GETDATE()) AS DateAdd),
        null,
        null,
        @_productID)
    IF @@ROWCOUNT = 0 GOTO errorHandler;

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE PROCEDURE lodgeSubComplaint @_complaintID int,
                                   @_subComplaintDesc varchar(5000)
AS
    BEGIN TRANSACTION

INSERT INTO COMPLAINT
VALUES (@_complaintID,
        (SELECT MAX(subComplaintID) from COMPLAINT where complaintID = @_complaintID) + 1,
        @_subComplaintDesc,
        0,
        GETDATE(),
        (SELECT DATEADD(day, 2, GETDATE()) AS DateAdd),
        null,
        null,
        (SELECT productID from COMPLAINT where complaintID = @_complaintID and subComplaintID = 0))
UPDATE COMPLAINT
SET status = 0
where complaintID = @_complaintID
    IF @@ROWCOUNT = 0 GOTO errorHandler;

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE procedure login @_email VARCHAR(50),
                       @_password VARCHAR(20)
as
    if exists(select 1
              from USERS
              where userEmail = @_email
                and password = @_password)
        begin
            select r.roleName
            from ROLE r,
                 USER_ROLE ur
            where ur.userEmail = @_email
              and r.roleID = ur.roleID
              and ur.[default] = 1;
            select userEmail username, firstName, lastName from USERS where userEmail = @_email;
            return 0;
        end
    else
        begin
            return -1;
        end
go

CREATE PROCEDURE registerProduct @_productName varchar(40),
                                 @_category varchar(20),
                                 @_customerEmail varchar(50),
                                 @_projectManagerEmail varchar(50),
                                 @_accountCoordinatorEmail varchar(50),
                                 @_createdAdmin varchar(50)
AS
    BEGIN TRANSACTION
INSERT INTO PRODUCT
VALUES ((Select MAX(productID) FROM PRODUCT) + 1,
        @_productName,
        @_category,
        @_customerEmail,
        @_projectManagerEmail,
        @_accountCoordinatorEmail,
        GETDATE(),
        @_createdAdmin, null, null)
    IF @@ROWCOUNT = 0 GOTO errorHandler;

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE PROCEDURE registerUser @_firstname VARCHAR(40),
                              @_lastname VARCHAR(40),
                              @_email VARCHAR(50),
                              @_password VARCHAR(20),
                              @_roles roles READONLY,
                              @_contactNumber VARCHAR(20),
                              @_defaultRole INT,
                              @_createdAdmin VARCHAR(50)
AS
    BEGIN TRANSACTION

INSERT INTO USERS
VALUES (@_email, @_password, @_firstname, @_lastname, @_contactNumber, 'none', null, @_createdAdmin, GETDATE(), null,
        null);
    IF @@ROWCOUNT = 0 GOTO errorHandler;

DECLARE
    role_cursor CURSOR FOR SELECT *
                           FROM @_roles
DECLARE @role INT
    OPEN role_cursor
    FETCH NEXT FROM role_cursor INTO @role
    WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @role = @_defaultRole
                BEGIN
                    INSERT INTO USER_ROLE VALUES (@_email, @role, 1);
                END
            ELSE
                BEGIN
                    INSERT INTO USER_ROLE VALUES (@_email, @role, 0);
                END

            FETCH NEXT FROM role_cursor INTO @role
        END


    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE procedure roleChange @_username VARCHAR(50),
                            @_requestedRole VARCHAR(25)
as
    if exists(select 1
              from USER_ROLE ur
                       join ROLE r on r.roleID = ur.roleID
              where ur.userEmail = @_username
                and r.roleName = @_requestedRole)
        begin
            select r.roleName
            from ROLE r
                     join USER_ROLE ur on r.roleID = ur.roleID
            where ur.userEmail = @_username
              and r.roleName = @_requestedRole;
            select userEmail username from USERS where userEmail = @_username;
            return 0;
        end
    else
        begin
            return -1;
        end
go

CREATE procedure updateSelectedUserDetails @_oldEmail VARCHAR(50),
                                           @_firstname VARCHAR(40),
                                           @_lastname VARCHAR(40),
                                           @_newEmail VARCHAR(50),
                                           @_password VARCHAR(20),
                                           @_roles roles READONLY,
                                           @_contactNumber VARCHAR(20),
                                           @_defaultRole INT,
                                           @_modifiedAdmin VARCHAR(50)
AS
    BEGIN TRANSACTION

DECLARE
    cursor_email CURSOR FOR SELECT userEmail, roleID
                            FROM USER_ROLE
                            WHERE userEmail = @_oldEmail
declare @username varchar(50), @roleID int

    OPEN cursor_email
    fetch next from cursor_email into @username, @roleID
    while @@fetch_status = 0
        begin
            delete from USER_ROLE where userEmail = @username AND roleID = @roleID
            fetch next from cursor_email into @username, @roleID
        end

UPDATE USERS
SET userEmail    = @_newEmail,
    firstName    = @_firstname,
    lastName     = @_lastname,
    password     = @_password,
    contactNumber= @_contactNumber,
    modifiedBy   = @_modifiedAdmin,
    modifiedAt   = GETDATE()
WHERE userEmail = @_oldEmail;

DECLARE
    role_cursor CURSOR FOR SELECT *
                           FROM @_roles
DECLARE @role INT
    OPEN role_cursor
    FETCH NEXT FROM role_cursor INTO @role
    WHILE @@FETCH_STATUS = 0
        BEGIN
            IF @_defaultRole = null
                BEGIN
                    GOTO errorHandler;
                END
            ELSE
                IF @role = @_defaultRole
                    BEGIN
                        INSERT INTO USER_ROLE VALUES (@_newEmail, @role, 1);
                    END
                ELSE
                    BEGIN
                        INSERT INTO USER_ROLE VALUES (@_newEmail, @role, 0);
                    END

            FETCH NEXT FROM role_cursor INTO @role
        END

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE procedure userToolbarDetails @_username VARCHAR(50)
as
    if exists(select 1
              from USERS
              where userEmail = @_username)
        begin
            select firstName from USERS where userEmail = @_username

            select r.roleName
            from ROLE r,
                 USER_ROLE ur
            where ur.userEmail = @_username
              and r.roleID = ur.roleID;

            select r.roleName defaultRole
            from ROLE r,
                 USER_ROLE ur
            where ur.userEmail = @_username
              and r.roleID = (
                select roleID from USER_ROLE where userEmail = @_username and [default] = 'true'
            );

            return 0;
        end
    else
        begin
            return -1;
        end
go

