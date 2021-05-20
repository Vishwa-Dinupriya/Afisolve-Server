create view AyomaView_Users_And_UserRole AS
    select u.userID, u.userEmail, u.firstName, u.lastName, u.contactNumber, u.activeStatus, u.password, ur.roleID, ur.[default], r.roleName
from USERS u, USER_ROLE ur, Role r
where u.userID = ur.userID AND ur.roleID=r.roleID

create view Ayoma_ProjectManagers AS
select u.userID, u.userEmail, u.firstName, u.lastName, u.contactNumber, u.activeStatus, u.password, ur.roleID, ur.[default], r.roleName
from USERS u, USER_ROLE ur, Role r
where u.userID = ur.userID AND ur.roleID=r.roleID AND r.roleName = 'project-manager'

create view Ayoma_AccountCoordinators AS
select u.userID, u.userEmail, u.firstName, u.lastName, u.contactNumber, u.activeStatus, u.password, ur.roleID, ur.[default], r.roleName
from USERS u, USER_ROLE ur, Role r
where u.userID = ur.userID AND ur.roleID=r.roleID AND r.roleName = 'account-coordinator'

create view Ayoma_Developers AS
select u.userID, u.userEmail, u.firstName, u.lastName, u.contactNumber, u.activeStatus, u.password, ur.roleID, ur.[default], r.roleName
from USERS u, USER_ROLE ur, Role r
where u.userID = ur.userID AND ur.roleID=r.roleID AND r.roleName = 'developer'
