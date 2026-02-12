import { Routes, Route, Navigate } from "react-router-dom";
import AnalyticsLayout from "./AnalyticsLayout";

import Overview from "./sections/Overview";
import Employment from "./sections/Employment";
import Industry from "./sections/Industry";
import Progression from "./sections/Progression";
import Programs from "./sections/Programs";
import Trends from "./sections/Trends";

const AnalyticsDashboard = () => {
  return (
    <Routes>
      <Route element={<AnalyticsLayout />}>
        <Route index element={<Navigate to="overview" replace />} />
        <Route path="overview" element={<Overview />} />
        <Route path="employment" element={<Employment />} />
        <Route path="industry" element={<Industry />} />
        <Route path="progression" element={<Progression />} />
        <Route path="programs" element={<Programs />} />
        <Route path="trends" element={<Trends />} />
      </Route>
    </Routes>
  );
};

export default AnalyticsDashboard;
