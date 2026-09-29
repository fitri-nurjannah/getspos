import moment from 'moment';

export class DashboardHelpers {
  constructor() {}

  /**
   * Sets the status of Active, Scheduled or Expired
   */
  public static setStatuses(_indexData): any {
    let activeAds = 0;
    let scheduledAds = 0;
    let expiredAds = 0;

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

  public static setStatus(_indexData, IMAGE_BASE_URL: string = 'assets/images/userFiles/'): any {
    const arrayOfPlaylists = _indexData.playlists || _indexData;
    let activePlaylists = 0;
    let scheduledPlaylists = 0;
    let expiredPlaylists = 0;
    const timeNow = moment();
  
    if (!Array.isArray(arrayOfPlaylists)) return _indexData;
  
    arrayOfPlaylists.forEach((playlist) => {
      let overallPlaylistStatus = 'expired';
      const blocks = playlist.playlistblocks || [];
  
      // --- 1. PRE-CALCULATE COVER IMAGES ---
      const collectedImages: string[] = [];
      const blockCount = playlist.playlistblocks ? playlist.playlistblocks.length : 0;
      const defaultImage = 'assets/images/cover.png';
      
      for (const block of blocks) {
        block.coverImageName? collectedImages.push(IMAGE_BASE_URL + block.coverImageName) : collectedImages.push(defaultImage);
        if (blockCount === collectedImages.length) break;
      }

      playlist.computedCoverImages = collectedImages;
  
      // --- 2. ASSIGN PRIMARY BLOCK (For Schedule Display) ---
      playlist.primaryBlock = blocks[0] || null;
      
      // --- 3. EXISTING STATUS LOGIC ---
      for (const block of blocks) {
        // Calculate Individual File Statuses ---
        if (block.files && block.files.length > 0) {
          block.files.forEach(file => {
            const expiresAt = file.playlistfile?.expiresAt;
            if (expiresAt) {
              const fileExpiry = moment(expiresAt);
              file.isExpired = fileExpiry.isBefore(timeNow);
              file.fileStatus = file.isExpired ? 'expired' : 'active';
            } else {
              file.isExpired = false;
              file.fileStatus = 'active';
            }
          });
        }

        let currentBlockStatus = 'expired';
        const blockStartDate = moment(block.startDate).startOf('day');
        const blockEndDate = moment(block.endDate).endOf('day');
  
        if (blockStartDate.isAfter(timeNow)) {
          currentBlockStatus = 'scheduled';
        } else if (blockEndDate.isBefore(timeNow)) {
          currentBlockStatus = 'expired';
        } else if (timeNow.isSameOrAfter(blockStartDate) && timeNow.isSameOrBefore(blockEndDate)) {
          let isTimeActive = false;
          if (!block.playlistschedules || block.playlistschedules.length === 0) {
            isTimeActive = true;
          } else {
            for (const schedule of block.playlistschedules) {
              const schedStart = moment(schedule.startTime); 
              const schedEnd = moment(schedule.endTime);
              const startTimeToday = moment(timeNow).set({ hour: schedStart.hour(), minute: schedStart.minute(), second: 0 });
              const endTimeToday = moment(timeNow).set({ hour: schedEnd.hour(), minute: schedEnd.minute(), second: 0 });
  
              if (startTimeToday.isAfter(endTimeToday)) {
                if (timeNow.isSameOrAfter(startTimeToday) || timeNow.isBefore(endTimeToday)) { isTimeActive = true; break; }
              } else {
                if (timeNow.isSameOrAfter(startTimeToday) && timeNow.isBefore(endTimeToday)) { isTimeActive = true; break; }
              }
            }
          }
          currentBlockStatus = isTimeActive ? 'active' : 'scheduled';
        }
        block.status = currentBlockStatus;
        if (currentBlockStatus === 'active') overallPlaylistStatus = 'active';
        else if (currentBlockStatus === 'scheduled' && overallPlaylistStatus !== 'active') overallPlaylistStatus = 'scheduled';
      }
  
      playlist.status = overallPlaylistStatus;
      if (overallPlaylistStatus === 'active') activePlaylists++;
      else if (overallPlaylistStatus === 'scheduled') scheduledPlaylists++;
      else expiredPlaylists++;
    });
  
    // 4. Return Data
    return {
      playlists: arrayOfPlaylists,
      activePlaylists: activePlaylists,
      scheduledPlaylists: scheduledPlaylists,
      expiredPlaylists: expiredPlaylists
    };
  };
    // Return logic remains the same...
    //return _indexData;
  
}
