create table TASK
(
    taskID               int not null
        constraint TASK_pk
            primary key nonclustered,
    complaintID             int,
    subComplaintID          int,
    assignDate              datetime,
    deadline                datetime,
    task_status             varchar(20), /* Pendind,InProgress,Completed */
    task_description        varchar(200),
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
