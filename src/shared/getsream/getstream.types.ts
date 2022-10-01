import * as Stream from 'getstream';
import {
    AggregatedActivity,
    AggregatedActivityEnriched,
    FlatActivity,
    FlatActivityEnriched,
    NotificationActivity,
    NotificationActivityEnriched,
} from 'getstream/lib/feed';

export type Activity = Stream.Activity<any>;
export type Reaction = Stream.Reaction;
export type ActivityResponse =
    | FlatActivity[]
    | FlatActivityEnriched[]
    | AggregatedActivity[]
    | AggregatedActivityEnriched[]
    | NotificationActivity[]
    | NotificationActivityEnriched[];
