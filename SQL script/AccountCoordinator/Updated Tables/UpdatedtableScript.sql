create table TASK
(
    taskID                  int not null
        constraint TASK_pk
            primary key nonclustered,
    complaintID             int,
    subComplaintID          int,
    assignDate              datetime,
    deadline                datetime,
    task_status             varchar(20), /* Pendind,InProgress,Completed */
    task_description        varchar(200),
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
