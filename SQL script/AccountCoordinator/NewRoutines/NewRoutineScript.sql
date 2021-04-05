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
        @_accountCoordinatorEmail,
        @_developerEmail)
    IF @@ROWCOUNT = 0 GOTO errorHandler;

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go
/*Add Complaints*/

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
/* Update Complaint Status */
create procedure updateSelectedComplaintStatusDetails (@_ID INT, @_subID INT, @_Status varchar(10))
AS
    BEGIN TRANSACTION
UPDATE COMPLAINT
SET status = (select statusID from COMPLAINT_STATUS where statusName = @_Status )
WHERE complaintID = @_ID AND  subComplaintID = @_subID

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

/* Update developer task details */
create procedure updateDevTaskStatus (@_taskID INT,@_task_status varchar(20))
AS
    BEGIN TRANSACTION
UPDATE TASK
SET task_status = @_task_status
WHERE taskID = @_taskID;

    COMMIT TRANSACTION;
    RETURN 0;

    errorHandler:
    ROLLBACK TRANSACTION
    RETURN -1;
go

