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
INSERT INTO TASK
VALUES ((Select MAX(taskID) FROM TASK) + 1,
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

create procedure updateSelectedComplaintStatusDetails (@_ID INT, @_subID INT, @_Status varchar(10))
AS
    BEGIN TRANSACTION
UPDATE COMPLAINT
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


