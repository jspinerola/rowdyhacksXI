export interface EventDetails {
  id: string; // from <guid>
  title: string;
  link: string;
  host: string;
  location: string;
  descriptionHtml: string; // The raw HTML from <description>
  startDate: Date;
  endDate: Date;
  imageUrl?: string;
  eventPlans?: EventPlans;
}

export interface EventPlans {
  budget?: number;
}
