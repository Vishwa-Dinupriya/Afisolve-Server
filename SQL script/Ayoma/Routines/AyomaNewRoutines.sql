CREATE procedure getSelectedDevTaskDetails(@_taskID int)
as
    if exists(select 1 from TASK where taskID = @_taskID)
        begin
            select * from TASK where taskID = @_taskID
            select u.contactNumber,u.firstName + ' '+u.lastName as accoorName, u.userEmail as accountCoordinatorEmail
            from USERS u, TASK t
            where u.userID = t.accountCoordinatorID


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

CREATE procedure getSelectedAccComplaintDetailsCurrent(@_complaintID int,
                                             @_subComplaintID int)
as
    if exists(select 1
              from COMPLAINT
              where complaintID = @_complaintID
                and subComplaintID = @_subComplaintID)
        begin
           select * from COMPLAINT where complaintID = @_complaintID AND subComplaintID = @_subComplaintID
           select * from Ayoma_ProjectManagers ap,PRODUCT p where ap.userID = p.projectManagerID
           select * from COMPLAINT_ATTACHMENT_DETAILS where complaintID=@_complaintID and subComplaintID=@_subComplaintID

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

CREATE PROCEDURE createTask @_complaintID int,
                            @_subComplaintID int,
                            @_deadline datetime,
                            @_taskdescription varchar(200),
                            @_accountCoordinatorEmail varchar(50),
                            @_developerEmail varchar(50)
AS
    BEGIN TRANSACTION
DECLARE @currentMaxtaskID int;
DECLARE @taskID int;
    SET @currentMaxtaskID = (SELECT MAX(taskID) from TASK) ;
    SET @taskID = iif(@currentMaxtaskID is null , 1 , @currentMaxtaskID+1);
INSERT INTO TASK
VALUES (@taskID,
        @_complaintID,
        @_subComplaintID,
        GETDATE(),
        @_deadline,
        'Pending',
        @_taskdescription,
        (select userID from USERS where userEmail= @_accountCoordinatorEmail),
        (select userID from USERS where userEmail=@_developerEmail))
    IF @@ROWCOUNT = 0 GOTO errorHandler;

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go
CREATE procedure getSelectedTaskDetails(@_taskID int)
as
    if exists(select 1 from TASK where taskID = @_taskID)
begin
    select * from TASK where taskID = @_taskID
    select u.contactNumber from USERS u, TASK t
    where u.userID = t.developerID

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

CREATE PROCEDURE AccCoordinatoraddComplaint @_productID int,
                              @_description varchar(5000)
AS
    BEGIN TRANSACTION
DECLARE @currentMaxComplaintID int;
DECLARE @complaintID int;
    SET @currentMaxComplaintID = (SELECT MAX(complaintID) from COMPLAINT) ;
    SET @complaintID = iif(@currentMaxComplaintID is null , 1 , @currentMaxComplaintID+1);
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

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go


CREATE procedure getSelectedTaskDetails(@_taskID int)
as
    if exists(select 1 from TASK where taskID = @_taskID)
begin
    select * from TASK where taskID = @_taskID
    select u.contactNumber from USERS u, TASK t
    where u.userID = t.developerID

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

CREATE procedure updateComplaintStatusDetailsByAccoor (@_ID INT, @_subID INT, @_Status varchar(10))
AS
    BEGIN TRANSACTION
DECLARE @wipStartDate int;
   if   @_Status = 'InProgress'
        UPDATE COMPLAINT
        SET status = (select statusID from COMPLAINT_STATUS where statusName = @_Status ),  wipStartDate = GETDATE()
        WHERE complaintID = @_ID AND  subComplaintID = @_subID
    else if @_Status = 'Completed'
            UPDATE COMPLAINT
            SET status = (select statusID from COMPLAINT_STATUS where statusName = @_Status ),  finishedDate = GETDATE()
            WHERE complaintID = @_ID AND  subComplaintID = @_subID
    else UPDATE COMPLAINT
         SET status = (select statusID from COMPLAINT_STATUS where statusName = @_Status )
         WHERE complaintID = @_ID AND  subComplaintID = @_subID

    IF @@ROWCOUNT = 0 GOTO errorHandler;
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go



create procedure updateDevTaskStatus (@_taskID INT,@_task_status varchar(20))
AS
    BEGIN TRANSACTION
UPDATE TASK
SET task_status = @_task_status
WHERE taskID = @_taskID;

IF @@ROWCOUNT = 0 GOTO errorHandler;
    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go


