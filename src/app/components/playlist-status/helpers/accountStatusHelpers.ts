import moment from 'moment';

export class AccountStatusHelpers {
  constructor() {}

  /**
   * Sets the status of Active, Scheduled or Expired
   */
  public static setStatuses(_indexData, socketData): any {
    const socketKey = _indexData.userId + '_' + _indexData.id;

    let activeAds = 0;
    let scheduledAds = 0;
    let expiredAds = 0;
    let subAccountStatus: 'online' | 'offline' = 'offline';

    if(socketData){
      const isExisted = Object.keys(socketData).includes(socketKey);

      if (isExisted) {
        subAccountStatus = 'online';
      }
      //console.log('isExisted '+ socketKey + ' ' + socketData.socketKey, isExisted);
    }

    _indexData.subAccountStatus = subAccountStatus;
    _indexData.activeAds = activeAds;
    _indexData.scheduledAds = scheduledAds;
    _indexData.expiredAds = expiredAds;

    const playlistsData = this.setStatus(_indexData.playlists);

    _indexData.playlists = playlistsData.playlists;
    _indexData.activePlaylists = playlistsData.activePlaylists;
    _indexData.scheduledPlaylists = playlistsData.scheduledPlaylists;
    _indexData.expiredPlaylists = playlistsData.expiredPlaylists;

    return _indexData;
  }

  public static setStatus(_indexData): any {
    const arrayOfPlaylists = _indexData.playlists || _indexData;
  
    let activePlaylists = 0;
    let scheduledPlaylists = 0;
    let expiredPlaylists = 0;
  
    const timeNow = moment();
  
    if (!Array.isArray(arrayOfPlaylists)) {
      console.error("Data provided is not an array");
      return _indexData;
    }
  
    // 1. Loop through each Playlist
    arrayOfPlaylists.forEach((playlist) => {
      
      // This variable tracks the status of the ENTIRE playlist
      // Priority: 'active' > 'scheduled' > 'expired'
      let overallPlaylistStatus = 'expired'; 
  
      const blocks = playlist.playlistblocks || [];
  
      // 2. Loop through every block to determine its individual status
      for (const block of blocks) {
        
        let currentBlockStatus = 'expired'; // Default status for THIS block

        // --- A. Check Block Dates ---
        const blockStartDate = moment(block.startDate).startOf('day');
        const blockEndDate = moment(block.endDate).endOf('day');
  
        const isDateFuture = blockStartDate.isAfter(timeNow);
        const isDatePast = blockEndDate.isBefore(timeNow);
        const isDateActive = timeNow.isSameOrAfter(blockStartDate) && timeNow.isSameOrBefore(blockEndDate);
  
        if (isDateFuture) {
          currentBlockStatus = 'scheduled';
        } 
        else if (isDatePast) {
          currentBlockStatus = 'expired';
        } 
        else if (isDateActive) {
          // --- B. Check Schedules (Only if Date is currently Active) ---
          
          // Default to 'active' if no schedules exist (implies playing all day), 
          // otherwise default to 'scheduled' (waiting for time slot)
          let isTimeActive = false;

          if (!block.playlistschedules || block.playlistschedules.length === 0) {
            isTimeActive = true;
          } else {
            for (const schedule of block.playlistschedules) {
              const schedStart = moment(schedule.startTime); 
              const schedEnd = moment(schedule.endTime);
    
              const startTimeToday = moment(timeNow).set({
                hour: schedStart.hour(),
                minute: schedStart.minute(),
                second: 0,
                millisecond: 0
              });
    
              const endTimeToday = moment(timeNow).set({
                hour: schedEnd.hour(),
                minute: schedEnd.minute(),
                second: 0,
                millisecond: 0
              });
    
              // Handle Overnight vs Standard
              if (startTimeToday.isAfter(endTimeToday)) {
                if (timeNow.isSameOrAfter(startTimeToday) || timeNow.isBefore(endTimeToday)) {
                    isTimeActive = true;
                    break; // Found an active time slot, stop checking schedules
                }
              } else {
                if (timeNow.isSameOrAfter(startTimeToday) && timeNow.isBefore(endTimeToday)) {
                  isTimeActive = true;
                  break; // Found an active time slot, stop checking schedules
                }
              }
            }
          }

          // If current time matched a schedule (or no schedules existed)
          if (isTimeActive) {
            currentBlockStatus = 'active';
          } else {
            // It is the correct date, but wrong time. It is scheduled for later today.
            currentBlockStatus = 'scheduled';
          }
        }

        // --- C. Assign Status to the Block Object ---
        block.status = currentBlockStatus;

        // --- D. Update Overall Playlist Status based on this Block ---
        // Logic: 
        // 1. If ANY block is 'active', Playlist is 'active'.
        // 2. If NO block is 'active' but ANY block is 'scheduled', Playlist is 'scheduled'.
        // 3. Otherwise, Playlist stays 'expired'.
        
        if (currentBlockStatus === 'active') {
            overallPlaylistStatus = 'active';
        } else if (currentBlockStatus === 'scheduled') {
            // Only upgrade to scheduled if we aren't already active
            if (overallPlaylistStatus !== 'active') {
                overallPlaylistStatus = 'scheduled';
            }
        }
      }
  
      // 3. Assign final status to Playlist and increment counters
      playlist.status = overallPlaylistStatus;
  
      if (overallPlaylistStatus === 'active') {
        activePlaylists++;
      } else if (overallPlaylistStatus === 'scheduled') {
        scheduledPlaylists++;
      } else {
        expiredPlaylists++;
      }
    });
  
    // 4. Return Data
    if (_indexData.playlists) {
      if(_indexData.playlists) _indexData.playlists = arrayOfPlaylists;
      
      _indexData.activePlaylists = activePlaylists;
      _indexData.scheduledPlaylists = scheduledPlaylists;
      _indexData.expiredPlaylists = expiredPlaylists;
      
      return _indexData;
    } else {
      return {
        playlists: arrayOfPlaylists,
        activePlaylists: activePlaylists,
        scheduledPlaylists: scheduledPlaylists,
        expiredPlaylists: expiredPlaylists
      };
    }
  };
}
