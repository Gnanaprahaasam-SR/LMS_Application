import * as React from 'react';
// import styles from './LearningManagementSystem.module.scss';
import type { ILearningManagementSystemProps } from './ILearningManagementSystemProps';
// import { escape } from '@microsoft/sp-lodash-subset';
import { HashRouter, Route, Routes } from "react-router-dom";
import 'bootstrap/dist/css/bootstrap.min.css';
import Header from './Header/Header';
import Dashboard from './Dashboard/Dashboard';
import Orientation from './Orientation/Orientation';
import Policies from './Policy/Policy';
import PolicyPDFs from './Policy/PolicyPdf';
import Trainings from './Training/Training';
import TrainingPPTs from './Training/TrainingPpt';
import TrainingVideos from './Training/TrainingVideos';
import styles from './LearningManagementSystem.module.scss'
import PolicyIndividualPage from './Policy/PolicyIndividualPage';
import OrientationIndividualPage from './Orientation/OrientationIndividualPage';
import TrainingIndividualPage from './Training/TrainingIndividualPage';

export default class LearningManagementSystem extends React.Component<ILearningManagementSystemProps> {
  public render(): React.ReactElement<ILearningManagementSystemProps> {
    const {
      // description,
      // isDarkTheme,
      // environmentMessage,
      // hasTeamsContext,
      // userDisplayName
      userId,
      context
    } = this.props;
    // console.log(context);
    return (
      <section className={`${styles.global}`}>
        <HashRouter>
          <Header context={context} />
          <Routes>
            <Route path="/" element={<Dashboard context={context} />} />
            <Route path="/orientations" element={<Orientation context={context} userId={userId} />} />
            <Route path="/orientation/:orientationId" element={<OrientationIndividualPage context={context} userId={userId} />} />
            <Route path="/policies" element={<Policies context={context} userId={userId} />} />
            <Route path="/policy/:policyId" element={<PolicyIndividualPage context={context} userId={userId} />} />
            <Route path="/policy-pdfs" element={<PolicyPDFs context={context} />} />
            <Route path="/trainings" element={<Trainings context={context} />} />
            <Route path="/training/:trainingId" element={<TrainingIndividualPage context={context} userId={userId} />} />
            <Route path="/training-ppts" element={<TrainingPPTs context={context} />} />
            <Route path="/training-videos" element={<TrainingVideos context={context} />} />
            {/* <Route path="/view/:type/:id" element={<ViewItem context={context} />} /> */}

          </Routes>
        </HashRouter>
      </section>
    );
  }
}
