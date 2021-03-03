import React, { useState, useEffect } from "react";
import DataTable from "react-data-table-component";
import Card from "@material-ui/core/Card";
import axiosConfig from "./config/axios/axiosConfig";
import SortIcon from "@material-ui/icons/ArrowDownward";
import _ from "lodash";
import moment from "moment";

/**
 * Defined Columns for DataTable
 */
const columns: { name: string; selector: string; sortable: boolean }[] = [
  {
    name: "User ID",
    selector: "userId",
    sortable: true,
  },
  {
    name: "Name",
    selector: "name",
    sortable: true,
  },
  {
    name: "Email",
    selector: "email",
    sortable: true,
  },
  {
    name: "Last (most recent) login time",
    selector: "lastLoginTime",
    sortable: true,
  },
  {
    name: "Last (most recent) login IP address",
    selector: "lastLoginIp",
    sortable: true,
  },
];

/**
 * Defined type for userInfo,userDetail
 */
type userInfo = {
  userId: number;
  name: string;
  email: string;
  loginTime: Date | null;
  lastLoginTime: string;
  lastLoginIp: string;
};

type userDetail = {
  userId: number;
  logins: { login_time: Date | null; ip_v4: string; country: string }[];
};


/**
 * Condition to highlight record who haven't logged in for at least one month.
 */
const conditionalRowStyles = [
  {
    when: (row: any) => {
      return moment().diff(moment(row.loginTime), "months", true) >= 1
        ? true
        : false;
    },
    style: {
      backgroundColor: "#ff9999",
    },
  },
];

/**
 * React App Component with function component return type
 */
const App: React.FC = () => {
  const [user, setUser] = useState<userInfo[] | null>();

  useEffect(() => {
    /**
     * fetchData() to get user and it's login detail from backend
     */
    async function fetchData() {
      axiosConfig
        .get("/users", {})      // Get user records
        .then((users) => {
          if (users.data.length > 0) {
            let Options: userInfo[] = [];
            users.data.map(async (s: any) => {
              await axiosConfig
                .get(`/users/${s.id}/relationships/logins`, {})  //Get user login details
                .then(async (userDetail) => {
                  if (userDetail) {
                    let detail: userDetail = userDetail.data;
                    detail.logins = _.orderBy(
                      detail.logins,
                      "login_time",
                      "desc"
                    );
                    if (detail.logins[0].country) {
                      detail.logins[0].ip_v4 = `${detail.logins[0].ip_v4}(${detail.logins[0].country})`; //If ip is correct and have country
                    }
                    Options.push({
                      userId: s.id,
                      name:s.first_name.toString() + " " + s.last_name.toString(),
                      email: s.email.toString(),
                      loginTime: detail.logins[0].login_time,
                      lastLoginTime: detail.logins[0].login_time
                        ? moment(detail.logins[0].login_time).fromNow()
                        : "",
                      lastLoginIp: detail.logins[0].ip_v4
                        ? `${detail.logins[0].ip_v4}`
                        : "",
                    });
                    Options = _.orderBy(Options, "userId");
                    return setUser(await Options);
                  }
                })
                .catch((err) => {
                  console.log("err in usersDetail", err);
                });
            });
          }
        })
        .catch((err) => {
          console.log("err in users", err);
        });
    }
    fetchData();
  }, []);

  return (
    <div>
      <Card>
        {user && user.length > 0 && (
          <DataTable
            title="Users"
            columns={columns}
            data={user}
            defaultSortField="userId"
            sortIcon={<SortIcon />}
            pagination
            selectableRows
            conditionalRowStyles={conditionalRowStyles}
          />
        )}
      </Card>
    </div>
  );
};

export default App;
