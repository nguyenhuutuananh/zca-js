import { appContext } from "../context.js";

export enum GroupEventType {
    JOIN_REQUEST,
    JOIN,
    LEAVE,
    REMOVE_MEMBER,
    BLOCK_MEMBER,

    UPDATE_SETTING,
    UPDATE,
    NEW_LINK,

    ADD_ADMIN,
    REMOVE_ADMIN,

    NEW_PIN_TOPIC,
    UPDATE_PIN_TOPIC,
    REORDER_PIN_TOPIC,

    UPDATE_BOARD,
    REMOVE_BOARD,

    UPDATE_TOPIC,
    UNPIN_TOPIC,
    REMOVE_TOPIC,

    UNKNOWN,
}

export type Member = {
    id: string;
    dName: string;
    avatar: string;
    type: number;
    avatar_25: string;
};

export type GroupSetting = {
    blockName: number;
    signAdminMsg: number;
    addMemberOnly: number;
    setTopicOnly: number;
    enableMsgHistory: number;
    joinAppr: number;
    lockCreatePost: number;
    lockCreatePoll: number;
    lockSendMsg: number;
    lockViewMember: number;
    bannFeature: number;
    dirtyMedia: number;
    banDuration: number;
};

export type GroupTopic = {
    type: number;
    color: number;
    emoji: string;
    startTime: number;
    duration: number;
    params: string;
    id: string;
    creatorId: string;
    createTime: number;
    editorId: string;
    editTime: number;
    repeat: number;
    action: number;
};

export type GroupInfo = {
    group_link?: string;
    link_expired_time?: number;
    [key: string]: any;
};

export type GroupExtraData = {
    featureId?: number;
    field?: string;
    [key: string]: any;
};

export type TGroupEventBase = {
    subType: number;
    groupId: string;
    creatorId: string;
    groupName: string;
    sourceId: string;
    updateMembers: Member[];
    groupSetting: GroupSetting;
    groupTopic: GroupTopic | null;
    info: GroupInfo;
    extraData: GroupExtraData;
    time: string;
    avt: null;
    fullAvt: null;
    isAdd: number;
    hideGroupInfo: number;
    version: string;
    groupType: number;
    clientId: number;
    errorMap: Record<string, any>;
    e2ee: number;
};

export type TGroupEventJoinRequest = {
    uids: string[];
    totalPending: number;
    groupId: string;
    time: string;
};

export type TGroupEventPinTopic = {
    oldBoardVersion: number;
    boardVersion: number;
    topic: GroupTopic;
    actorId: string;
    groupId: string;
};

export type TGroupEventReorderPinTopic = {
    oldBoardVersion: number;
    actorId: string;
    topics: {
        topicId: string;
        topicType: number;
    }[];
    groupId: string;
    boardVersion: number;
    topic: null;
};

export type TGroupEventBoard = {
    sourceId: string;
    groupName: string;
    groupTopic: GroupTopic;
    groupId: string;
    creatorId: string;

    subType?: number;
    updateMembers?: Member[];
    groupSetting?: GroupSetting;
    info?: GroupInfo;
    extraData?: GroupExtraData;
    time?: string;
    avt?: null;
    fullAvt?: null;
    isAdd?: number;
    hideGroupInfo?: number;
    version?: string;
    groupType?: number;
};

export type TGroupEvent =
    | TGroupEventBase
    | TGroupEventJoinRequest
    | TGroupEventPinTopic
    | TGroupEventReorderPinTopic
    | TGroupEventBoard;

export type GroupEvent =
    | {
          type: GroupEventType.JOIN_REQUEST;
          data: TGroupEventJoinRequest;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.NEW_PIN_TOPIC | GroupEventType.UNPIN_TOPIC | GroupEventType.UPDATE_PIN_TOPIC;
          data: TGroupEventPinTopic;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.REORDER_PIN_TOPIC;
          data: TGroupEventReorderPinTopic;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: GroupEventType.UPDATE_BOARD | GroupEventType.REMOVE_BOARD;
          data: TGroupEventBoard;
          threadId: string;
          isSelf: boolean;
      }
    | {
          type: Exclude<
              GroupEventType,
              | GroupEventType.JOIN_REQUEST
              | GroupEventType.NEW_PIN_TOPIC
              | GroupEventType.UNPIN_TOPIC
              | GroupEventType.UPDATE_PIN_TOPIC
              | GroupEventType.REORDER_PIN_TOPIC
              | GroupEventType.UPDATE_BOARD
              | GroupEventType.REMOVE_BOARD
          >;
          data: TGroupEventBase;
          threadId: string;
          isSelf: boolean;
      };

export function initializeGroupEvent(data: TGroupEvent, type: GroupEventType): GroupEvent {
    const threadId = data.groupId;
    if (type == GroupEventType.JOIN_REQUEST) {
        return { type, data: data as TGroupEventJoinRequest, threadId, isSelf: false };
    } else if (type == GroupEventType.NEW_PIN_TOPIC || type == GroupEventType.UNPIN_TOPIC || type == GroupEventType.UPDATE_PIN_TOPIC) {
        return {
            type,
            data: data as TGroupEventPinTopic,
            threadId,
            isSelf: (data as TGroupEventPinTopic).actorId == appContext.uid,
        };
    } else if (type == GroupEventType.REORDER_PIN_TOPIC) {
        return {
            type,
            data: data as TGroupEventReorderPinTopic,
            threadId,
            isSelf: (data as TGroupEventPinTopic).actorId == appContext.uid,
        };
    } else if (type == GroupEventType.UPDATE_BOARD || type == GroupEventType.REMOVE_BOARD) {
        return {
            type,
            data: data as TGroupEventBoard,
            threadId,
            isSelf: (data as TGroupEventBoard).sourceId == appContext.uid,
        };
    } else {
        const baseData = data as TGroupEventBase;

        return {
            type,
            data: baseData,
            threadId,
            isSelf:
                baseData.updateMembers.some((member) => member.id == appContext.uid!) ||
                baseData.sourceId == appContext.uid,
        };
    }
}
