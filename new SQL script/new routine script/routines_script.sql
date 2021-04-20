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
DECLARE @userID int;
SELECT @userID = userID
FROM USERS
where userEmail = @_username;
    if exists(select 1
              from USERS
              where userEmail = @_username)
        begin

            DECLARE cursor_email CURSOR LOCAL FOR SELECT userID, roleID FROM USER_ROLE WHERE userID = @userID

            declare @userIDTemp int, @roleID int

            OPEN cursor_email
            fetch next from cursor_email into @userIDTemp, @roleID

            while @@fetch_status = 0
                begin
                    delete from USER_ROLE where userID = @userIDTemp AND roleID = @roleID
                    fetch next from cursor_email into @userIDTemp, @roleID
                end

            DELETE FROM USERS WHERE userEmail = @_username;
            CLOSE cursor_email
        end
    else
        begin
            return -1;
        end
go

CREATE procedure getCustomerComplaintsByStatusID @_customerEmail VARCHAR(50),
                                                 @_reqComplaintsStatus int
as
DECLARE @customerID int;
SELECT @customerID = userID
FROM USERS
where userEmail = @_customerEmail;
    if exists(select 1
              from COMPLAINT c)
        begin
            if (@_reqComplaintsStatus = -1)
                BEGIN
                    select *
                    from COMPLAINT C
                             JOIN PRODUCT P ON C.productID = P.productID
                    where C.subComplaintID != 0
                      and P.customerID = @customerID
                    select *
                    from COMPLAINT C
                             JOIN PRODUCT P ON C.productID = P.productID
                    where C.subComplaintID = 0
                      and P.customerID = @customerID
                    RETURN 0;
                END
            else
                if (@_reqComplaintsStatus = 0)
                    BEGIN
                        select *
                        from COMPLAINT C
                                 JOIN PRODUCT P ON C.productID = P.productID
                        where C.subComplaintID != 0
                          and P.customerID = @customerID
                          and C.status = 0
                        select *
                        from COMPLAINT C
                                 JOIN PRODUCT P ON C.productID = P.productID
                        where C.subComplaintID = 0
                          and P.customerID = @customerID
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
                              and P.customerID = @customerID
                              and C.status = 1
                            select *
                            from COMPLAINT C
                                     JOIN PRODUCT P ON C.productID = P.productID
                            where C.subComplaintID = 0
                              and P.customerID = @customerID
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
                                  and P.customerID = @customerID
                                  and C.status = 2
                                select *
                                from COMPLAINT C
                                         JOIN PRODUCT P ON C.productID = P.productID
                                where C.subComplaintID = 0
                                  and P.customerID = @customerID
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
                                      and P.customerID = @customerID
                                      and C.status = 3
                                    select *
                                    from COMPLAINT C
                                             JOIN PRODUCT P ON C.productID = P.productID


                                    where C.subComplaintID = 0
                                      and P.customerID = @customerID
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
                     JOIN PRODUCT P2 on USR.userID = P2.projectManagerID
            where P2.productID = (select P.productID
                                  from PRODUCT P
                                           JOIN COMPLAINT C2 on P.productID = C2.productID
                                  where C2.complaintID = @_complaintID
                                    and C2.subComplaintID = @_subComplaintID)

            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P2 on USR.userID = P2.accountCoordinatorID
            where P2.productID = (select P.productID
                                  from PRODUCT P
                                           JOIN COMPLAINT C2 on P.productID = C2.productID
                                  where C2.complaintID = @_complaintID
                                    and C2.subComplaintID = @_subComplaintID)

            select *
            from COMPLAINT_ATTACHMENT_DETAILS
            where complaintID = @_complaintID and subComplaintID = @_subComplaintID

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

CREATE procedure getSelectedComplaintDetailsCustomer @_customerEmail VARCHAR(50),
                                                     @_complaintID int,
                                                     @_subComplaintID int
as
    if (@_customerEmail = (select customerEmail
                           from PRODUCT P
                                    join COMPLAINT C3 on P.productID = C3.productID
                           where C3.complaintID = @_complaintID
                             and c3.subComplaintID = @_subComplaintID))
        begin
            select * from COMPLAINT where complaintID = @_complaintID and subComplaintID = @_subComplaintID
            select statusName
            from COMPLAINT_STATUS CS
                     JOIN COMPLAINT C on CS.statusID = C.status
            where C.complaintID = @_complaintID
              and C.subComplaintID = @_subComplaintID
            select productName
            from PRODUCT P
                     join COMPLAINT C2 on P.productID = C2.productID
            where C2.complaintID = @_complaintID
              and C2.subComplaintID = @_subComplaintID
            select userEmail, firstName, lastName
            from USERS U
            where userEmail = (select projectManagerEmail
                               from PRODUCT P
                                        join COMPLAINT C2 on P.productID = C2.productID
                               where C2.complaintID = @_complaintID
                                 and C2.subComplaintID = @_subComplaintID)
            select userEmail, firstName, lastName
            from USERS U
            where userEmail = (select accountCoordinatorEmail
                               from PRODUCT P
                                        join COMPLAINT C2 on P.productID = C2.productID
                               where C2.complaintID = @_complaintID
                                 and C2.subComplaintID = @_subComplaintID)
            select *
            from COMPLAINT_ATTACHMENT_DETAILS
            where complaintID = @_complaintID and subComplaintID = @_subComplaintID
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

CREATE procedure getSelectedProductDetails(@_productID int)
as
    if exists(select 1
              from PRODUCT
              where productID = @_productID)
        begin
            select * from PRODUCT where productID = @_productID
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P1 on USR.userID = P1.customerID
            where P1.productID = @_productID
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P2 on USR.userID = P2.projectManagerID
            where P2.productID = @_productID
            select userEmail, firstName, lastName
            from USERS USR
                     JOIN PRODUCT P3 on USR.userID = P3.accountCoordinatorID
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
DECLARE @userID int;
SELECT @userID = userID
FROM USERS
where userEmail = @_username;

    if exists(select 1
              from USERS
              where userEmail = @_username) and
       exists(select 1
              from USER_ROLE ur
              where ur.userID = @userID
                and ur.[default] = 'true')
        begin
            select * from USERS where userEmail = @_username
            select ur.roleID from USER_ROLE ur where ur.userID = @userID;
            select ur.roleID from USER_ROLE ur where ur.userID = @userID and ur.[default] = 'true';
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
              where c.complaintID = @_complainId
                and c.subComplaintID != 0)
        begin
            select * from COMPLAINT where subComplaintID != 0 and complaintID = @_complainId
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
                                @_description varchar(5000),
                                @_noOfImages int
AS
    BEGIN TRANSACTION

DECLARE @currentMaxComplaintID int;
DECLARE @complaintID int;
    SET @currentMaxComplaintID = (SELECT MAX(complaintID)
                                  from COMPLAINT) ;
    SET @complaintID = iif(@currentMaxComplaintID is null, 1, @currentMaxComplaintID + 1);

INSERT INTO COMPLAINT
VALUES (@complaintID,
        0,
        @_description,
        0,
        GETDATE(),
        (SELECT DATEADD(day, 2, GETDATE()) AS DateAdd),
        null,
        null,
        @_productID)
    IF @@ROWCOUNT = 0 GOTO errorHandler;

DECLARE @i int;
    SET @i = 0;
    WHILE @i < @_noOfImages
        BEGIN
            SET @i = @i + 1
            /* your code*/
            INSERT INTO COMPLAINT_ATTACHMENT_DETAILS
            VALUES (@complaintID, 0, @i, TRIM(STR(@complaintID)) + '-' + '0' + '-' + TRIM(STR(@i)) + '.png')
        END

SELECT *
FROM COMPLAINT_ATTACHMENT_DETAILS
WHERE complaintID = @complaintID
  and subComplaintID = 0;

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

CREATE PROCEDURE lodgeSubComplaint @_complaintID int,
                                   @_subComplaintDesc varchar(5000)
AS
DECLARE
    @subComplaintID int;
    SET @subComplaintID = ((SELECT MAX(@subComplaintID)
                            from COMPLAIN
                            where complaintID = @_complaintID) + 1);
    BEGIN TRANSACTION

INSERT INTO COMPLAINT
VALUES (@_complaintID,
        iif(@subComplaintID is null, 1, @subComplaintID),
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
DECLARE @userID int;
SELECT @userID = userID
FROM USERS
where userEmail = @_email;
    if exists(select 1
              from USERS
              where userEmail = @_email
                and password = @_password)
        begin
            select r.roleName
            from ROLE r,
                 USER_ROLE ur
            where ur.userID = @userID
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
DECLARE @customerID int;
SELECT @customerID = userID
FROM USERS
where userEmail = @_customerEmail;

DECLARE @projectManagerID int;
SELECT @projectManagerID = userID
FROM USERS
where userEmail = @_projectManagerEmail;

DECLARE @accountCoordinatorID int;
SELECT @accountCoordinatorID = userID
FROM USERS
where userEmail = @_accountCoordinatorEmail;

DECLARE @createdAdminID int;
SELECT @createdAdminID = userID
FROM USERS
where userEmail = @_createdAdmin;


DECLARE
    @productID int;
    SET @productID = ((SELECT MAX(productID)
                       from PRODUCT) + 1);
    BEGIN TRANSACTION
INSERT INTO PRODUCT
VALUES (iif(@productID is null, 1, @productID),
        @_productName,
        @_category,
        @customerID,
        @projectManagerID,
        @accountCoordinatorID,
        GETDATE(),
        @createdAdminID, null, null)
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
DECLARE
    @userID int;
    SET @userID = ((SELECT MAX(userID)
                    from USERS) + 1);
    BEGIN TRANSACTION

INSERT INTO USERS
VALUES (iif(@userID is null, 1, @userID), @_email, @_password, @_firstname, @_lastname, @_contactNumber, 'none', null,
        @_createdAdmin, GETDATE(), null,
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
                    INSERT INTO USER_ROLE VALUES (iif(@userID is null, 1, @userID), @role, 1);
                END
            ELSE
                BEGIN
                    INSERT INTO USER_ROLE VALUES (iif(@userID is null, 1, @userID), @role, 0);
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
DECLARE @userID int;
SELECT @userID = userID
FROM USERS
where userEmail = @_username;
    if exists(select 1
              from USER_ROLE ur
                       join ROLE r on r.roleID = ur.roleID
              where ur.userID = @userID
                and r.roleName = @_requestedRole)
        begin
            select r.roleName
            from ROLE r
                     join USER_ROLE ur on r.roleID = ur.roleID
            where ur.userID = @userID
              and r.roleName = @_requestedRole;
            select userEmail username from USERS where userEmail = @_username;
            return 0;
        end
    else
        begin
            return -1;
        end
go

CREATE PROCEDURE saveComment @_senderEmail varchar(50),
                             @_complaintID int,
                             @_text varchar(MAX),
                             @_noOfImages int
AS
DECLARE @senderID int;
SELECT @senderID = userID
FROM USERS
where userEmail = @_senderEmail;
    BEGIN TRANSACTION


DECLARE @currentMaxCommentID int;
DECLARE @commentID int;
    SET @currentMaxCommentID = (SELECT MAX(commentID)
                                from COMMENT
                                where complaintID = @_complaintID) ;
    SET @commentID = iif(@currentMaxCommentID is null, 1, @currentMaxCommentID + 1);
    IF (@_text is not null)
        BEGIN
            INSERT INTO COMMENT
            VALUES (@_complaintID,
                    @commentID,
                    0,
                    @_text,
                    @senderID,
                    GETDATE(),
                    0)
            IF @@ROWCOUNT = 0 GOTO errorHandler;
        end
    SET @currentMaxCommentID = (SELECT MAX(commentID)
                                from COMMENT
                                where complaintID = @_complaintID) ;
    SET @commentID = iif(@currentMaxCommentID is null, 1, @currentMaxCommentID + 1);
DECLARE @i int;
    SET @i = 0;
    WHILE @i < @_noOfImages
        BEGIN
            SET @i = @i + 1
            /* your code*/
            INSERT INTO COMMENT
            VALUES (@_complaintID, @commentID, 1, TRIM(STR(@_complaintID)) + '-' + TRIM(STR(@i)) + '.png', @senderID,
                    GETDATE(), 0)
            SELECT * FROM COMMENT where complaintID = @_complaintID and commentID = @commentID
            SET @commentID = @commentID + 1
        END

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
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
DECLARE @userID int;
SELECT @userID = userID
FROM USERS
where userEmail = @_oldEmail;
    BEGIN TRANSACTION

DECLARE
    cursor_email CURSOR FOR SELECT userID, roleID
                            FROM USER_ROLE
                            WHERE userID = @userID
declare @userIDTemp int, @roleID int

    OPEN cursor_email
    fetch next from cursor_email into @userIDTemp, @roleID
    while @@fetch_status = 0
        begin
            delete from USER_ROLE where userID = @userIDTemp AND roleID = @roleID
            fetch next from cursor_email into @userIDTemp, @roleID
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
                        INSERT INTO USER_ROLE VALUES (@userID, @role, 1);
                    END
                ELSE
                    BEGIN
                        INSERT INTO USER_ROLE VALUES (@userID, @role, 0);
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
DECLARE @userID int;
SELECT @userID = userID
FROM USERS
where userEmail = @_username;
    if exists(select 1
              from USERS
              where userEmail = @_username)
        begin
            select firstName from USERS where userEmail = @_username

            select r.roleName
            from ROLE r,
                 USER_ROLE ur
            where ur.userID = @userID
              and r.roleID = ur.roleID;

            select r.roleName defaultRole
            from ROLE r,
                 USER_ROLE ur
            where ur.userID = @userID
              and r.roleID = (
                select roleID from USER_ROLE where USER_ROLE.userID = @userID and [default] = 'true'
            );

            return 0;
        end
    else
        begin
            return -1;
        end
go

